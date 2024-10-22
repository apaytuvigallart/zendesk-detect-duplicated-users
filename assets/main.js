// self-invoking function
(function () {

    // return a Zendesk Client Object
    var client = ZAFClient.init();
    client.invoke('resize', { width: '100%', height: '400px' });
    
    // get ticket.requester.id, ticket.requester.name and ticket.requester.email from the current ticket. 
    // pass both data and client objects to the processTicketData function
    client.get(['ticket.requester.id', 'ticket.requester.name', 'ticket.requester.email'])
        .then((data) => processTicketData(data, client))
        .catch((error) => handleError(error, client));  

})();

// process ticket data from client.get 
async function processTicketData(data, client) {
    try {
        // declare variables from data
        const {
            'ticket.requester.id': requesterId,
            'ticket.requester.name': requesterName,
            'ticket.requester.email': requesterEmail
        } = data;
    
        // send an API request to Zendesk Search user. It'll display all users that have the same name than the requester and excludes any user that has the requester's email
        const checkDuplicated = await client.request({
            url: `/api/v2/users/search?query=name:"${requesterName}" -email:${requesterEmail}`, // using template literals (``) to allow multi-string and variables 
            type: 'GET',
            contentType: 'application/json'
        });

        // if result is 0, it means there are no users to merge. We are using the ternary condition
        const result = checkDuplicated.users.length === 0
            ? 'There are no users to merge'
            : `There are ${checkDuplicated.users.length} users that could be merged`; // using template literals to allow multi-string and variables

        // send data to showInfo
        showInfo(requesterId, requesterName, requesterEmail, checkDuplicated, result, client);
    }
    catch (error) {
        handleError(error, client);
    }
}

// show info in HTML template
async function showInfo(requesterId, requesterName, requesterEmail, checkDuplicated, result, client) {
    
    // we only need the ID, name and email of users that can be merged. So, we declare an array variable that only selects those values
    const usersToMerge = checkDuplicated.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email
    }));

    // we assign the variables an argument that we'll use in HTML
    const requesterData = {
        'requester-id': requesterId,
        'requester-name': requesterName,
        'requester-email': requesterEmail,
        'users-to-merge': usersToMerge,
        'result': result,
        'is-positive': checkDuplicated.users.length > 0
    };
    
    // render the Handlebars template
    const source = document.getElementById('requester-template').innerHTML;
    const template = Handlebars.compile(source);
    const contentElement = document.getElementById('content');
    contentElement.innerHTML = template(requesterData);

    // check if checkDuplicated lenght is bigger than 0. If true, attach an event listener. 
    if (checkDuplicated.users.length > 0) {
        const mergeButton = document.getElementById('merge-button');
        if (mergeButton) {
            mergeButton.removeEventListener('click', handleMergeButtonClick); // remove existing listener to prevent duplication
            mergeButton.addEventListener('click', () => handleMergeButtonClick(requesterId, checkDuplicated, client));
        }
    }
}

// merge users from checkDuplicated
async function handleMergeButtonClick(requesterId, checkDuplicated, client) {
    
    try {
        client.invoke('notify', `Users are being merged to ${requesterId}. This may take a few minutes.`, 'notice'); // send a notification that users are being merged
        // Use async/await with a delay between requests
        for (const [index, user] of checkDuplicated.users.entries()) {
            await delay(index * 2000); // delay of 2 seconds
            // API request to merge userId (potential duplicated user) to requesterId (user that created the ticket, aka requester)
            await client.request({
                url: `/api/v2/users/${user.id}/merge`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ "user": { "id": requesterId } })
            });
        }
        client.invoke('notify', `Users have been successfully merged to ${requesterId}.`, 'notice'); // send a notification that users have been merged
    } 
    catch (error) {
        handleError(error, client);
    }
}

// Utility function for delaying API requests
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// handle errors
function handleError(error, client) {
    console.error('An error occurred:', error);
    client.invoke('notify',`An error occurred: ${error}`, 'error')
}