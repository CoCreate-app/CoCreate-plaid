import api from '@cocreate/api'

const CoCreatePlaid = {
	name: 'plaid',
	endPoints: {
		plaidGetLinkToken: {
			response: function( data){
				console.log(data)
				const configs = {
				  token: data.data.link_token,
				  env: 'sandbox',
				  onSuccess: async function(public_token, metadata){
					 api.send('plaid', 'plaidGetAccessToken', {"public_token":public_token});
				  },
				  onExit: async function(err, metadata) {
					 if (err != null) {
						 console.log(err);
						 console.log(metadata);   
					 }
				  }
				}
				const linkHandler = Plaid.create(configs);
				linkHandler.open();
			},
		},
		plaidGetPublicToken: {},
		plaidCreateBankLink: {},
		plaidTransaction: {},
		plaidBalances: {},
		plaidAuth: {}
	}	
}

api.init(CoCreatePlaid);