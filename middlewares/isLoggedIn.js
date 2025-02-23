import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

export const isLoggedIn = ( req, res, next) => {
   //get token from header
   const token = getTokenFromHeader(req)
   //verify the token
   const decodedUser = verifyToken(token)
   //decodedUser = { id: '65a389f22479f20554b7170b', iat: 1734963446, exp: 1735827446 }
   //save the user into req.obj
   if(!decodedUser){
    throw new Error('Invalid/Expired token, please login again')
   }
   else{
       req.userAuthId = decodedUser?.id;
       next()
   }

}