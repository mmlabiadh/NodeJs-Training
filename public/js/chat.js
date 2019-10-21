const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageInput = $messageForm.querySelector('input');
const $messageButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');

const $messages = document.querySelector('#messages');
const $templateMessage = document.querySelector('#template-message').innerHTML;
const $templateLocationMessage = document.querySelector('#template-location-message').innerHTML;

socket.on('message', (message) => {
    const html = Mustache.render($templateMessage, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

socket.on('location-message', (locationMessage) => {
    console.log(locationMessage);
    const html = Mustache.render($templateLocationMessage, {
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()
    $messageButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageButton.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();
        return error ? console.log(error) : console.log('message delivered');
    })
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        $locationButton.setAttribute('disabled', 'disabled');
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled');
        })
    })
})