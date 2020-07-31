const socket = io();

// Elements

const $messageForm = document.querySelector('form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible Height

    const visibleHeight = $messages.offsetHeight;

    //Height of messages container

    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }


};

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Diaable button
    $messageFormButton.setAttribute('disabled', 'disabled');

    const clientMessage = e.target.elements.message.value;
    socket.emit('sendMessage', clientMessage, (error) => {

        // Enable button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log('The message was delivered!');
    });
});

socket.on('relayMessage', (serverMessage) => {
    console.log('Message Received: ', serverMessage);

    const html = Mustache.render(messageTemplate, {
        username: serverMessage.username,
        message: serverMessage.text,
        createdAt: moment(serverMessage.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    });
    document.querySelector('#sidebar').innerHTML = html;
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const coords = { lat: position.coords.latitude, long: position.coords.longitude };
        socket.emit('location', coords, () => {
            $locationButton.removeAttribute('disabled');
            console.log('Location shared!');
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});