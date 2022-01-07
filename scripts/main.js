var myImage = document.querySelector('img');

myImage.onclick = function() {
    var mySrc = myImage.getAttribute('src');
    if (mySrc === 'images/website-drawing-scan.png') {
        myImage.setAttribute ('src','images/photo2.jpg');
    } else {
        myImage.setAttribute ('src','images/website-drawing-scan.png');
    }
}

var myButton = document.querySelector('button');
var myHeading = document.querySelector('h1');

function setUserName() {
    var myName = prompt('Пожалуйста введите свое имя.');
    localStorage.setItem('name', myName);
    myHeading.textContent = 'Моего Бро зовут ' + myName + '!';
}

if(!localStorage.getItem('name')) {
    setUserName();
} else {
    var storedName = localStorage.getItem('name');
    myHeading.textContent = 'Моего Бро зовут ' + storedName + '!';
}

myButton.onclick = function() {
    setUserName();
}