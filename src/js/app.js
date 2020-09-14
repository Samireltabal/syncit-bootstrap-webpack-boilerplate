import axios from 'axios'
export function ping() {
    axios.get('https://api.futurelines.net/api/ping').then((response) => {
        $("#pingResult").text(response)
    }).catch((error) => {
        $("#pingResult").text(error)
    })
}