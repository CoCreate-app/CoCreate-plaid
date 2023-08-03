'use strict'
const api = require('@cocreate/api');
// const plaid = require('plaid');

class CoCreatePlaid {
    constructor(wsManager) {
        this.wsManager = wsManager;
        this.name = 'plaid';
        this.init();
    }

    init() {
        if (this.wsManager) {
            this.wsManager.on(this.name, (socket, data) => this.sendPlaid(socket, data));
        }
    }

    async sendPlaid(socket, data) {
        let params = data['data'];
        let environment;
        let action = data['action'];
        let plaid = false;
        const plaidInst = require('plaid');

        try {
            let org = await api.getOrg(data, this.name);
            if (params.environment) {
                environment = params['environment'];
                delete params['environment'];
            } else {
                environment = org.apis[this.name].environment;
            }
            plaid = new plaidInst.Client({
                clientID: org.apis[this.name][environment].clientID,
                secret: org.apis[this.name][environment].secret,
                env: plaid.environments.sandbox,
            });
        } catch (e) {
            console.log(this.name + " : Error Connect to api", e)
            return false;
        }

        try {
            let response
            switch (action) {
                case 'plaidGetLinkToken':
                    response = this.plaidGetLinkToken(socket, action, client, params);
                    break;
                case 'plaidGetPublicToken':
                    response = this.plaidGetPublicToken(socket, action, client);
                case 'plaidGetAccessToken':
                    response = this.plaidGetAccessToken(socket, action, client, params);
                case 'plaidTransaction':
                    response = this.pladTransaction(socket, action, client, params);
                    break;
                case 'plaidBalances':
                    response = this.plaidBalances(socket, action, client, params);
                    break;
                case 'plaidAuth':
                    response = this.plaidAuth(socket, action, client, params);
                    break;
                default:
                    break;
            }
            this.wsManager.send(socket, { method: this.name, action, response })

        } catch (error) {
            this.handleError(socket, action, error)
        }
    }

    handleError(socket, action, error) {
        const response = {
            'object': 'error',
            'data': error || error.response || error.response.data || error.response.body || error.message || error,
        };
        this.wsManager.send(socket, { method: this.name, action, response })
    }

    async plaidGetLinkToken(client, params) {
        const { userId, legalName, phoneNumber, email } = params;
        try {
            console.log({
                user: {
                    client_user_id: userId,
                    legal_name: legalName,
                    phone_number: phoneNumber,
                    email_address: email,
                },
                client_name: 'CoCreate',
                products: ['transactions'],
                country_codes: ['US'],
                language: 'en',
                webhook: 'https://webhook.sample.com',
            })
            const response = await client.createLinkToken({
                user: {
                    client_user_id: userId,
                    legal_name: legalName,
                    phone_number: phoneNumber,
                    email_address: email,
                },
                client_name: 'CoCreate',
                products: ['transactions'],
                country_codes: ['US'],
                language: 'en',
                webhook: 'https://webhook.sample.com',
            });
            return response
        } catch (e) {
            console.log(e)
        }
    }

    async plaidGetAccessToken(client, data) {
        console.log("plaidGetAccessToke", data)
        let public_token = data;
        const response = await client.exchangePublicToken(public_token);
        return response
    }

    async pladTransaction(client, params) {
        const { accessToken } = params;
        const response = await client.getTransactions(accessToken, '2018-01-01', '2020-02-01', {})
            .catch((err) => {
                console.error(err.message);
            });
        return response
    }

    async plaidBalances(client, params) {
        const { accessToken } = params;
        const response = await client.getBalance(accessToken)
            .catch((err) => {
                console.error(err.message);
            });
        return response
    }

    async plaidAuth(client, params) {
        const { accessToken } = params;
        const response = await client.getAuth(accessToken)
            .catch((err) => {
                console.error(err.message);
            });
        return response
    }
}

module.exports = CoCreatePlaid;
