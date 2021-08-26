const router = require('express').Router()
var Razorpay=require("razorpay");
var path = require('path');
const { rzpKey, rzpSecret, bckHost } = require('../config/envExport');
const { getMovie } = require('../functions/movieFunctions');
const { tokenToId } = require('../functions/globalFunctions');
const { moviePurchased, webPurchased, packPurchased } = require('../functions/userFunctions');
const { paymentSuccess } = require('../functions/paymentFunctions');
const { getSeries } = require('../functions/webFunctions');
const { getPackage } = require('../functions/packageFunctions');

const instance = new Razorpay({
    key_id: rzpKey,
    key_secret: rzpSecret
})

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
        <script>
            var url = '${bckHost}/api/payment/razorpay/order';
            var params = {
                amount: ${money * 100},
                currency: "INR",
                receipt: "su001",
                payment_capture: '1'
            };

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function (res) {
                if (xmlHttp.readyState === 4) {
                    res = JSON.parse(xmlHttp.responseText);
                    document.getElementById('rzp-text').value = res.sub.id;
                    document.getElementById('rzp-button1').click()
                }
            }
            xmlHttp.open("POST", url, true); // false for synchronous request
            xmlHttp.setRequestHeader("Content-type", "application/json");
            xmlHttp.send(JSON.stringify(params));
        </script>
        <div id="pageContent">
            <label style="display: none;">Order id   :</label><input style="display: none;" type=text id=rzp-text /><br/>
            <button style="position: absolute; top: 50%;left: 50%; transform: translate(-50%,-50%); background-color: red; border: none; color: white; font-weight: 600; padding: 10px 30px;" id="rzp-button1">Checkout</button>
        <div>
        <div id=paymentDetails></div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
            document.getElementById('rzp-button1').onclick = function(e){
                var options = {
                    "key": "${rzpKey}",
                    "currency": "INR",
                    "name": "T-Flix",
                    "description": "${desc}",
                    "image": "${bckHost}/giveMeImg/logo",
                    "order_id": document.getElementById('rzp-text').value,
                    "handler": function (response){
                        // document.getElementById('order-pay-id').value=response.razorpay_payment_id;
                        // document.getElementById('order-id').value=response.razorpay_order_id;
                        // document.getElementById('order-sig').value=response.razorpay_signature;
                        // console.log(response)
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', '${bckHost}/api/payment/razorpay/done', true);
                        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                        xhr.onload = function (responseFromBck) {
                            // Request finished. Do processing here.
                            document.getElementById('pageContent').innerHTML = responseFromBck.currentTarget.response
                        };

                        xhr.send('${'pType=Razorpay&id='+id+'&type='+type+'&uid='+uid+'&data='}'+JSON.stringify(response));
                    },
                    "theme": {
                        "color": "red"
                    }
                };
                var rzp1 = new Razorpay(options);
                rzp1.open();
                e.preventDefault();
            }
        </script>
    `)
})

router.post("/order",(req,res)=>{
    params=req.body;
    instance.orders.create(params).then((data) => {
        res.send({"sub":data,"status":"success"});
    }).catch((error) => {
        res.send({"sub":error,"status":"failed"});
    })
});

router.post("/verify",(req,res)=>{
    body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', '<your secret>').update(body.toString()).digest('hex');
    console.log("sig"+req.body.razorpay_signature);
    console.log("sig"+expectedSignature);
    var response = {"status":"failure"}
    if(expectedSignature === req.body.razorpay_signature)
    response={"status":"success"}
    res.send(response);
});

router.post('/done', async(req, res)=>{
    const {id, type, uid, data, pType} = req.body
    const paymentRes = JSON.parse(data)
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
        paymentType: pType,
        item: type,
        itemId: id,
        paymentId: paymentRes.razorpay_payment_id,
        orderId: paymentRes.razorpay_order_id,
        signature: paymentRes.razorpay_signature
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
