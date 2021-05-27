

// define default parameters
let searchParams = new URLSearchParams(window.location.search);
let authorId = '53f59584dabfaee473f8045b';

if(searchParams.has('id')) {
    authorId = searchParams.get('id');
}









// -------------- DOCUMENT READY --------------

$(document).ready(function() {
    // do something
    $('#author_name').html(); // set author name
});