import Axios from 'axios'

const axios = Axios.create({
  timeout: 5000
})

export default axios
