i have a platform where businesses create account and they will be able to collect payment in naira with their customers paying in stablecoin like usdc,
the flow is just for them to register and the will be able to create qr code for the customers to scan and then they will proceed to conplete onchain transction which will trigger and offchain disbursement api which will send the naira value of the stablecoin sent by the customer to the merchant account number hwich has been provided when they registered their business
i want to create endpoint using next js api routes and mongodb and prisma.
here a list of things i want to
note that there will be 2 section of the api the admin and the normal user (business) who will sign in using email and password, admin to will have like a master email and password

1. businesses will be able to create account and login, update their profile details and also history for their transactions
2. there should be endpoint to be called by helius for webhook, which will create a transaction using the parsed data from helius in the enpdoint it will then call another endpooint to disburse naira to the bank for the business, all this details will be gotten from the parsed transaction from helius

3. for the admin, we should be able toggle active key on the business profile which will determine if the can receive payment, fetch all users , view transaction summary for each business, fetch all transsaction and filter by date, success and failed

business have mainly this data
businessLogo: string | null;
businessName: string;
email: string;
phone: string;
address: string;
businessType: string;
accountNumber: string;
bankId: string;
accountName: string;
password: string;
