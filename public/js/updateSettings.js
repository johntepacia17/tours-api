import axios from 'axios';
import { showAlert } from './alert';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {

    try {

        const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/update-password' : 'http://127.0.0.1:3000/api/v1/users/update-me';
        
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if(res.data.status === 'Success' || res.data.status === 'Success!') {
            showAlert('success', `${type.toUpperCase()} successfully updated!`);
        }

    } catch(err) {
        showAlert('error', err.response.data.message);
    }

}