import {roles} from '../../middleware/auth.js'







export  const endpoint  = {
    addToCart:[roles.User],
    deleteFromCart:[ roles.User],
}