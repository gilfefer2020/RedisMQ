function init() {
    var currentdate = new Date();
    var datetime = (currentdate.getUTCMonth() + 1) + "-" + currentdate.getUTCDate() + "-" + currentdate.getFullYear() + " " + currentdate.getUTCHours() + ":" + currentdate.getUTCMinutes() + ":" + currentdate.getUTCSeconds();
    document.getElementById('time').value = datetime;
    document.getElementById('url').value = "http://34.215.73.186:3000";
}
const getHelp = () => {
    const xhttp = new XMLHttpRequest();
    var url = document.getElementById('url').value;

    xhttp.open("GET", url, false);
    xhttp.send();

    const messages = xhttp.responseText;

    document.getElementById('helpmsg').innerHTML = messages;
}
const echoMessage = () => {

    var url = document.getElementById('url').value;

    var data = {};
    data.message = document.getElementById('message').value;
    data.time = document.getElementById('time').value;
    var json = JSON.stringify(data);

    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", url + '/echoAtTime', false);
    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhttp.send(json);
    document.getElementById('echomsgerror').innerHTML = xhttp.responseText;
}
const getAllEchoMessages = () => {
    const xhttp = new XMLHttpRequest();
    var url = document.getElementById('url').value;

    xhttp.open("GET", url + '/echoAllMsgs', false);
    xhttp.send();

    const messages = JSON.parse(xhttp.responseText);

    document.getElementById('allmsgs').innerHTML = messages;
}
const deleteMessage = () => {
    const xhttp = new XMLHttpRequest();
    var url = document.getElementById('url').value;

    var message = document.getElementById('msg1').value;
    xhttp.open("DELETE", url + '/echoAtTime/' + message, false);
    xhttp.send();

    const reply = JSON.parse(xhttp.responseText);

    document.getElementById('themessagedeleted').innerHTML = document.getElementById('themessagedeleted').innerHTML + reply;
}

init();