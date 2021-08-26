const router = require('express').Router()
const { stripeKey, stripeSecretKey, bckHost } = require('../config/envExport');
const { getMovie } = require('../functions/movieFunctions');
const { tokenToId } = require('../functions/globalFunctions');
const { moviePurchased, webPurchased, packPurchased } = require('../functions/userFunctions');
const { paymentSuccess } = require('../functions/paymentFunctions');
const { getSeries } = require('../functions/webFunctions');
const { getPackage } = require('../functions/packageFunctions');

const Publishable_Key = stripeKey
const Secret_Key = stripeSecretKey

// const stripe = require('stripe')(Secret_Key) 

router.use("/pay", async(req, res)=>{
    const { id, type, token } = req.query
    if((id == undefined || type == undefined || token == undefined)) res.send('Forbidden')
    const uid = tokenToId(token, true)

    const response = (
        (type=='movie')
        ?
        await getMovie(id)
        :
        (
            (type == 'web')
            ?
            await getSeries(id)
            :
            await getPackage(id)
        )
    )
    let money = response.data.rent || response.data.price
    let desc = response.data.title || response.data.name

    res.writeHead(200, { 'Content-Type': 'text/html' });

    res.end(`
            <!DOCTYPE html> 
            <html> 
            <title>Stripe Payment Demo</title>
            <style>
                .stripe-button-el{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                }            
            </style>
            <body> 
                <form action="${bckHost}/api/payment/stripe/done?id=${id}&uid=${uid}&type=${type}" method="POST"> 
                <script
                    src="//checkout.stripe.com/v2/checkout.js"
                    class="stripe-button"
                    data-key="${Publishable_Key}" 
                    data-amount="${money * 100}" 
                    data-currency="INR" 
                    data-name="TFlix" 
                    data-description="${desc}" 
                    data-locale="auto" > 
                </script> 
                </form> 
            </body> 
            <script>document.querySelector('.stripe-button-el').click()</script>
            </html> 
    `)
})

router.post('/done', async(req, res)=>{
    const {id, type, uid } = req.query
    const { stripeToken, stripeTokenType, stripeEmail } = req.body
    let responseTo =  (
        (type=='movie')
        ?
        await moviePurchased(id,uid)
        :
        (
            (type == 'web')
            ?
            await webPurchased(id, uid)
            :
            await packPurchased(id,uid)
        )
    )
    await paymentSuccess({
        paymentType: 'Stripe-' + stripeTokenType,
        item: type,
        itemId: id,
        paymentId: stripeToken,
        orderId: stripeTokenType,
        signature: stripeEmail
    })
    res.writeHead(200, { 'Content-Type': 'text/html' });
    if(responseTo.success) res.end(`
        <h3 style="color: green;text-align: center;">Payment Successfull! Reload Once to access Your premium features...!</h3>
    `)
    else res.end(`
        <h3 style="color: red;text-align: center;">Payment Unsuccessfull</h3>
    `)
})

module.exports = router
