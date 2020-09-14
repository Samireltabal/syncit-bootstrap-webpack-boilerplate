document.addEventListener("DOMContentLoaded", function(event) {
    const element = document.createElement('h1')
    element.innerHTML = "Hello World"
    document.body.appendChild(element)
})
import $ from 'jquery'
import boostrap from 'bootstrap'
require('popper.js');
import './index.css';
import { ping } from './js/app'

$("#jqueryTest").on('click', function () {
    ping()
})

