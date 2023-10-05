import userModel from '../../../../DB/model/User.model.js'
import sendEmail from '../../../utils/email.js'
import { hash, compare } from '../../../utils/HashAndCompare.js';
import { generateToken, verifyToken } from '../../../utils/GenerateAndVerifyToken.js'
import { asyncHandler } from '../../../utils/errorHandling.js'
import { customAlphabet } from 'nanoid'
import { auth } from '../../../middleware/auth.js';
export const signup = asyncHandler(async (req, res, next) => {

    const { userName, email, password } = req.body;
    if (await userModel.findOne({ email: email.toLowerCase() })) {
        return next(new Error("Email exist", { cause: 409 }))
    }
    const token = generateToken({ payload: { email }, signature: process.env.EMAIL_TOKEN, expiresIn: 60 * 5 })
    const refreshToken = generateToken({ payload: { email }, signature: process.env.EMAIL_TOKEN, expiresIn: 60 * 60 * 24 })

    const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`
    const rfLink = `${req.protocol}://${req.headers.host}/auth/NewConfirmEmail/${refreshToken}`

    const html = `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Email Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
            /* Reset CSS */
            body,
            table,
            tbody,
            tr,
            td,
            div,
            p,
            a {
                margin: 0;
                padding: 0;
                border: 0;
                outline: none;
                font-size: 100%;
                font-weight: normal;
                line-height: 1.5;
                text-decoration: none;
                vertical-align: baseline;
                background: transparent;
            }
    
            /* Email wrapper */
            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #333333;
                background-color: #f6f6f6;
                padding: 20px;
            }
    
            /* Main content */
            .content {
                background-color: #ffffff;
                padding: 40px;
                border-radius: 6px;
            }
    
            /* Logo */
            .logo img {
                max-width: 200px;
            }
    
            /* Heading */
            h1 {
                margin-top: 40px;
                margin-bottom: 20px;
                color: #333333;
                font-size: 24px;
                line-height: 1.2;
                font-weight: bold;
                text-align: center;
            }
    
            /* Paragraph */
            p {
                margin-bottom: 20px;
            }
    
            /* Call to action button */
            .cta-button {
                text-align: center;
                margin-top: 30px;
            }
    
            .cta-button a {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                padding: 10px 30px;
                border-radius: 4px;
                text-decoration: none;
             }
    
            /* Footer */
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #555555;
            }
    
            .footer p {
                margin-bottom: 0;
            }
        </style>
    </head>
    
    <body>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <table class="content" width="600" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" class="logo">
                                <img src="https://res.cloudinary.com/dczrkoxuk/image/upload/v1692007710/subCategory/awtxccssfa5sxlatiz9b.jpg" alt="Logo">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1>Confirm Your Email</h1>
                                <p>Dear ${userName}</p>
                                <p>Thank you for signing up. Please click the button below to confirm your email address:</p>
                                <div class="cta-button">
                                    <a href=${link}>Confirm Email</a>
                                </div>
                                <div class="cta-button">
                                <a href=${rfLink}>Re Confirm Email</a>
                            </div>
                                <p>If you did not sign up for our service, you can safely ignore this email.</p>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer">
                                <hr>
                                <p>&copy; 2022 Example Company. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    
    </html>`

    if (! await sendEmail({ to: email, subject: 'Confirmation-Email', html })) {
        return res.status(400).json({ message: "Email Rejected" })
    }
    const hashPassword = hash({ plaintext: password })
    const  userdata = await userModel.create({ userName, email, password: hashPassword })
    return res.status(201).json({ message: "Done", userdata })
})


export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { email } = verifyToken({ token, signature: process.env.EMAIL_TOKEN })
    if (!email) {
        return next(new Error("In-valid token payload", { cause: 400 }))
    }
    const user = await userModel.updateOne({ email: email.toLowerCase() }, { confirmEmail: true })

    if (!user.email) {
        return res.status(404).send(`<p>Not register account.</p>`)
    } else {
        return res.status(404).redirect(`${process.env.FE_URL}/#/login`)
    }
})

export const RequestNewConfirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { email } = verifyToken({ token, signature: process.env.EMAIL_TOKEN })
    if (!email) {
        return next(new Error("In-valid token payload", { cause: 400 }))
    }
    const user = await userModel.findOne({ email: email.toLowerCase() })

    if (!user) {

        return res.status(404).send(`<p>Not register account.</p>`)
    }
    if (user.confirmEmail) {
        return res.status(404).redirect(`${process.env.FE_URL}/#/login`)
    }
    const newToken = generateToken({ payload: { email }, signature: process.env.EMAIL_TOKEN, expiresIn: 60 * 2 })
    const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`
    const rfLink = `${req.protocol}://${req.headers.host}/auth/NewConfirmEmail/${token}`
     
    const html =`<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Email Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
            /* Reset CSS */
            body,
            table,
            tbody,
            tr,
            td,
            div,
            p,
            a {
                margin: 0;
                padding: 0;
                border: 0;
                outline: none;
                font-size: 100%;
                font-weight: normal;
                line-height: 1.5;
                text-decoration: none;
                vertical-align: baseline;
                background: transparent;
            }
    
            /* Email wrapper */
            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #333333;
                background-color: #f6f6f6;
                padding: 20px;
            }
    
            /* Main content */
            .content {
                background-color: #ffffff;
                padding: 40px;
                border-radius: 6px;
            }
    
            /* Logo */
            .logo img {
                max-width: 200px;
            }
    
            /* Heading */
            h1 {
                margin-top: 40px;
                margin-bottom: 20px;
                color: #333333;
                font-size: 24px;
                line-height: 1.2;
                font-weight: bold;
                text-align: center;
            }
    
            /* Paragraph */
            p {
                margin-bottom: 20px;
            }
    
            /* Call to action button */
            .cta-button {
                text-align: center;
                margin-top: 30px;
            }
    
            .cta-button a {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                padding: 10px 30px;
                border-radius: 4px;
                text-decoration: none;
             }
    
            /* Footer */
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #555555;
            }
    
            .footer p {
                margin-bottom: 0;
            }
        </style>
    </head>
    
    <body>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <table class="content" width="600" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" class="logo">
                                <img src="https://res.cloudinary.com/dczrkoxuk/image/upload/v1692007710/subCategory/awtxccssfa5sxlatiz9b.jpg" alt="Logo">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1>Confirm Your Email</h1>
                                <p>Dear ${userName}</p>
                                <p>Thank you for signing up. Please click the button below to confirm your email address:</p>
                                <div class="cta-button">
                                    <a href=${link}>Confirm Email</a>
                                </div>
                                <div class="cta-button">
                                <a href=${rfLink}>Re Confirm Email</a>
                            </div>
                                <p>If you did not sign up for our service, you can safely ignore this email.</p>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer">
                                <hr>
                                <p>&copy; 2022 Example Company. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    
    </html>`
    if (! await sendEmail({ to: email, subject: 'Confirmation-Email', html })) {
        return res.status(400).json({ message: "Email Rejected" })
    }
    return res.status(200).send("<p>New confirmation email sent to your inbox plz check it ASAP.</p>")

})


export const login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() })
    if (!user) {
        return next(new Error("Email  not exist", { cause: 404 }))
    }

    if (!user.confirmEmail) {
        return next(new Error("Please confirm your email", { cause: 400 }))
    }
    if (!compare({ plaintext: password, hashValue: user.password })) {
        return next(new Error("In-valid login data", { cause: 400 }))
    }
    const userToken = generateToken({ payload: { id: user._id, role: user.role }, expiresIn: 30 * 60 *24 })

    user.status = 'online'
    await user.save()
    return res.status(201).json({ message: "Done", userToken , role: user.role })
})


export const sendCode = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const forgetCode = customAlphabet('123456789', 6)
    const user = await userModel.findOneAndUpdate({ email: email.toLowerCase() }, { code: forgetCode() }, { new: true })
    if (!user) {
        return next(new Error('Not register account', { cause: 404 }))
    }

    const html = `<!DOCTYPE html>
    <html>
<head>
  <title>Change Password OTP</title>
</head>
<body>
<span class="mwai-text CWHqlUDu9z_VhM1iNYox">Certainly! Here's an example of an HTML template for sending an OTP (One-Time Password) for changing a password in Node.js:

html



  <title>Change Password OTP</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333333;
      margin-top: 0;
    }
    p {
      color: #555555;
      margin-bottom: 20px;
    }
    .otp-code {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
      margin-top: 10px;
      margin-bottom: 30px;
    }
    .footer {
      color: #777777;
      font-size: 12px;
    }
  </style>


  <div class="container">
    <h1>Change Password OTP</h1>
    <p>Dear User,</p>
    <p>Please use the following One-Time Password (OTP) to change your password:</p>
    <div class="otp-code">${user.code}</div>
    <p>This OTP is valid for a single use only .</p>
    <p>If you did not request this password change, please ignore this email.</p>
    <p class="footer">Thank you,<br>Hatem AbdelNoor Project </p>
  </div>





</body>
</html>`

    if (! await sendEmail({ to: email, subject: 'Forget Password', html })) {
        return res.status(400).json({ message: "Email Rejected" })
    }
    return res.status(200).json({ message: "Done" })

})


export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, password } = req.body

    const user = await userModel.findOne({ email: email.toLowerCase() })
    if (!user) {
        return next(new Error('Not register account', { cause: 404 }))
    }
    if (user.code != parseInt(code)) {
        return next(new Error('In-valid code', { cause: 400 }))
    }
    user.password = hash({ plaintext: password })
    user.code = null
    user.changePasswordTime = Date.now()
    await user.save()
    return res.status(200).json({ message: "Done" })

})

export const logout = asyncHandler(async (req, res, next)=>

{ 
    const { authorization } = req.headers
  const   token = authorization.split(process.env.BEARER_KEY)[1]

    const user = verifyToken({ token })
    console.log({user});

    
      const data = await userModel.findOneAndUpdate({_id:user.id},{  status: 'offline'  })

               await data.save()
               return res.status(201).json({ message: "Done" ,data})


}
)
