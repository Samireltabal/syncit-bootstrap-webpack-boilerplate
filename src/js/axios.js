import axios from 'axios';
import $ from 'jquery';
import moment from 'moment';
export async function initClass(token) {
    let data = {};
    await axios.get('https://api.futurelines.net/api/v2/class/mydata', {
        timeout: 5000,
        headers: {'Authorization': token}
    }).then((response) => {
        data = response
    });
    return data;
}

export async function fetchInfo(token, classId) {
    var url = "https://api.futurelines.net/api/stream/info/" + classId + "/" + token;
    var data;
    await axios.get(url).then((response) => {
        data = response
    })
    return data;
}
export async function fetchStudents(token, classId) {
    await axios.get('https://api.futurelines.net/api/v2/class/' + classId + '/students', {
        timeout: 5000,
        headers: {'Authorization': token}
    }).then((response) => {
        var list = $('#students');
        $(document).ready(function () {
            var studentList = response.data.students
            localStorage.setItem('students', JSON.stringify(response.data.students));
            studentList.forEach((student, key) => {
                var state = student.is_online ? '' : 'offline';
                var uuid = student.uuid;
                var paid = student.student[0].paid ? 'd-flex' : 'd-none';
                if(key == 0) {
                    list.html(`
                        <li id="${uuid}" class="StudentItem ${uuid} ${paid}">
                            <div class="bd-highlight d-flex">
                                <div class="img_cont">
                                    <div class="user_info">
                                        <span><i class="fas fa-fist-raised text-white" id="${uuid}"></i></span>
                                    </div><span class="online_icon ${state}"></span>
                                </div>
                                <div class="user_info">
                                    <span>${student.name}</span>
                                </div>
                            </div>
                        </li>
                    `);
                } else {
                    list.append(`
                        <li id="${uuid}" class="StudentItem ${uuid} ${paid}">
                            <div class="bd-highlight d-flex">
                                <div class="img_cont">
                                    <div class="user_info">
                                        <span><i class="fas fa-fist-raised text-white" id="${uuid}"></i></span>
                                    </div><span class="online_icon ${state}"></span>
                                </div>
                                <div class="user_info">
                                    <span>${student.name}</span>
                                </div>
                            </div>
                        </li>
                    `);
                }
            });
        });
    }).catch((error) => {
        console.log(error)
        //window.location.replace('https://futurelines.net/');
    })
};
export async function fetchChat(token ,classId, CurrentUser) {
    var url = 'https://api.futurelines.net/api/v2/class/chat/get/' + classId;
    await axios.get(url, {
        timeout: 5000,
        headers: {'Authorization': token}
    }).then((response) => {
        response.data.data.forEach((item, key) => {
            var date = moment(new Date(item.created_at)).fromNow();
            var photo = item.user.profile_picture;
            var message = item.content;
            var file_name = item.has_file ? item.file_name : '' 
            var file_url = item.has_file ? item.url : '' 
            var sent = CurrentUser.id === item.user_id ? true : false ;
            var name = item.user.name;
            if(key == 0) {
                if(sent) {
                    $('#chatbox').html(
                        `<div class="d-flex justify-content-${sent ? 'end' : 'start'} mb-4">
                            <div class="msg_cotainer${sent ? '_send' : ''}">
                                انت : ${message}
                                <span class="file"><a href="${file_url}" target="_blank">${file_name}</a></span>
                                <span class="msg_time">${date}</span>
                            </div>
                            <div class="img_cont_msg">
                                <img src="${photo}" class="rounded-circle user_img_msg">
                            </div>
                        </div>`)
                } else {
                    $('#chatbox').html(
                        `<div class="d-flex justify-content-${sent ? 'end' : 'start'} mb-4">
                            <div class="img_cont_msg">
                                <img src="${photo}" class="rounded-circle user_img_msg">
                            </div>    
                            <div class="msg_cotainer${sent ? '_send' : ''}">
                                ${name} : ${message}
                                <span class="file"><a href="${file_url}" target="_blank">${file_name}</a></span>
                                <span class="msg_time">${date}</span>
                            </div>
                        </div>`)
                }
            } else {
                if(sent) {
                    $('#chatbox').prepend(
                        `<div class="d-flex justify-content-${sent ? 'end' : 'start'} mb-4">
                            <div class="msg_cotainer${sent ? '_send' : ''}">
                                انت : ${message}
                                <span class="file"><a href="${file_url}" target="_blank">${file_name}</a></span>
                                <span class="msg_time">${date}</span>
                            </div>
                            <div class="img_cont_msg">
                                <img src="${photo}" class="rounded-circle user_img_msg">
                            </div>
                        </div>`)
                } else {
                    $('#chatbox').prepend(
                        `<div class="d-flex justify-content-${sent ? 'end' : 'start'} mb-4">
                            <div class="img_cont_msg">
                                <img src="${photo}" class="rounded-circle user_img_msg">
                            </div>    
                            <div class="msg_cotainer${sent ? '_send' : ''}">
                                ${name} : ${message}
                                <span class="file"><a href="${file_url}" target="_blank">${file_name}</a></span>
                                <span class="msg_time">${date}</span>
                            </div>
                        </div>`)
                }
            }
        });
    }).catch(() => {
        $('#chat').append('<p>error with fetching results</p>');
    })
}