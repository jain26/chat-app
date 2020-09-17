const socket=io()

//Elements
const $form1=document.querySelector('#form1')
const $locationButton=document.querySelector('#location-button')
const $form1Button=document.querySelector('#form1-button')
const $form1Input=document.querySelector('input')
const $messages=document.querySelector('#messages')

//Templates
const $messageTemplate=document.querySelector('#message-template').innerHTML
const $locationTemplate=document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix : true})

const autoScroll=()=>{
    //New message element
    $newMessage=$messages.lastElementChild

    //Height of new Message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMArgin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMArgin

    //Visible Height
    const visibleHeight=$messages.offsetHeight

    //Container Height
    const containerHeight=$messages.scrollHeight

    //How far i have scrolled?
    const scrollOffset=$messages.scrollTop+visibleHeight
    console.log(newMessageHeight +' '+visibleHeight+' '+containerHeight+' '+scrollOffset)

    if(containerHeight-newMessageHeight-3<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render($locationTemplate,{
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$form1.addEventListener('submit',(e)=>{
    e.preventDefault()
    $form1Button.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $form1Button.removeAttribute('disabled')
        $form1Input.value=''
        $form1Input.focus()
        if(error){
            return console.log(error)
        }
        
        console.log('delievered')
        
    })
})
$locationButton.addEventListener('click',()=>{
    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Location is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitute:position.coords.latitude,
            longitute:position.coords.longitude
        },
        ()=>{
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})