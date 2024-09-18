# Detect duplicated Users

## Objective
This Custom Application will help you detect if the Ticket's [Requester](https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#requesters-and-submitters) (the Requester is the User who is asking for support through a ticket) has a possible duplicated user. 

Once you open the Ticket, the Custom Application will display the following data:
- `Requester ID`: Requester's ID. If the Requester's ID `12345` created the Ticket, that's what will be displayed.
- `Requester Name`:	Requester's name and surname (if any).
- `Requester email address`: Requester's email address.
- `Result`: The Result will display all possible duplicated users, if any.

## How does it work?

Once you open the Ticket, the Custom Application will detect if the Requester has a duplicated User. It'll look for Users who have the same name but with a different email address. To achieve this, I'm using the [ZAF Client API](https://developer.zendesk.com/api-reference/apps/apps-core-api/client_api/). By calling [`client.request()`](https://developer.zendesk.com/api-reference/apps/apps-core-api/client_api/#clientrequestoptions), we can make HTTP request to:
- [`/api/v2/users/search`](https://developer.zendesk.com/api-reference/ticketing/users/users/#search-users): Search users that meet the search criteria.
- [`/api/v2/users/{user_id}/merge`](https://developer.zendesk.com/api-reference/ticketing/users/users/#merge-end-users): Merge the user in the path parameter to the user that is specified in the request body.

If the Custom Application detects a duplicated User, it'll display the Duplicated User's name and email address. Then, we simply have to click the `Merge` button to start the magic.

## Important

Please, note that you need to install the [Zendesk Command Line Interface (ZCLI)](https://developer.zendesk.com/documentation/apps/getting-started/using-zcli/#installing-and-updating-zcli), otherwise you will not be able to run `zcli apps:package {app_directory}` to package the application for manual uploads. 

Once you downloaded the code and installed the ZCLI, simply change directory and run `zcli apps:package`. A temporary folder will be created. Upload the `.zip` file to Zendesk by following this [documentation](https://developer.zendesk.com/documentation/apps/getting-started/uploading-and-installing-a-private-app/).
