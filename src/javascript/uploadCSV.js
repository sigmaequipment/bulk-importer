const fileInput = document.querySelector('input[type="file"]');
const form = new FormData();
form.append('file', fileInput.files[0]);

fetch('https://api.channeladvisor.com/v1/ProductUpload?access_token=xxxxxxxxxx&profileid=12345678&templatecode=MyTemplate&importtype=AddUpdate', {
    method: 'POST',
    body: form,
    headers: {
        'Content-Type': 'text/tab-separated-values'
    }
})
    .then(response => {
        // Handle response
    })
    .catch(error => {
        // Handle error
    });
