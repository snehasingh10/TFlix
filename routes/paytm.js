const router = require('express').Router()
const { paytmConfig, bckHost } = require('../config/envExport');
const { getMovie } = require('../functions/movieFunctions');
const { tokenToId } = require('../functions/globalFunctions');
const { moviePurchased, webPurchased, packPurchased } = require('../functions/userFunctions');
const { paymentSuccess } = require('../functions/paymentFunctions');
const { getSeries } = require('../functions/webFunctions');
const { getPackage } = require('../functions/packageFunctions');
const checksum_lib = require("./Paytm/checksum");

router.use("/pay", async (req, res) => {
    const { id, type, token } = req.query
    if ((id == undefined || type == undefined || token == undefined)) res.send('Forbidden')
    const uid = tokenToId(token, true)

    const response = (
        (type == 'movie')
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
            <html lang="en" dir="ltr">
            <head>
                <meta charset="utf-8">
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">
                <title>Paytm-Nodejs</title>
            </head>
            <body style="background-color:#f5f3ef">
                <div class="row my-5">
                <div class="col-md-4 offset-md-4">
                    <div class="card">
                    <div class="card-body">
                        <form class="" action="${bckHost}/api/payment/paytm/paynow" method="post">
                        <div class="form-group">
                            <label for="">ID: </label>
                            <input class="form-control" type="text" readonly name="name" value="${uid}">
                        </div>
                        <div class="form-group">
                            <label for="">Email: </label>
                            <input class="form-control" type="text" name="email" value="">
                        </div>
                        <div class="form-group">
                            <label for="">Phone: </label>
                            <input class="form-control" type="text" name="phone" value="">
                        </div>
                            <div class="form-group">
                            <label for="">Amount: </label>
                            <input class="form-control" type="text" name="amount" value="${money}" readonly>
                            <input class="form-control" type="hidden" name="id" value="${id}">
                            <input class="form-control" type="hidden" name="uid" value="${uid}">
                            <input class="form-control" type="hidden" name="type" value="${type}">
                        </div>
                        <div class="form-group">
                            <button class="btn form-control btn-primary">Pay Now</button>
                        </div>
                        </form>
                    </div>
                    </div>
                </div>
                </div>
            </body>
            </html>
    `)
})

router.post("/paynow", (req, res) => {
    // Route for making payment

    var paymentDetails = {
        amount: req.body.amount,
        customerId: req.body.name,
        customerEmail: req.body.email,
        customerPhone: req.body.phone
    }
    if (!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
        res.status(400).send('Payment failed')
    } else {
        var params = {};
        params['MID'] = paytmConfig.mid;
        params['WEBSITE'] = paytmConfig.website;
        params['CHANNEL_ID'] = 'WEB';
        params['INDUSTRY_TYPE_ID'] = 'Retail';
        params['ORDER_ID'] = 'TEST_' + new Date().getTime();
        params['CUST_ID'] = paymentDetails.customerId;
        params['TXN_AMOUNT'] = paymentDetails.amount;
        params['CALLBACK_URL'] = `${bckHost}/api/payment/paytm/done?id=${req.body.id}&uid=${req.body.uid}&type=${req.body.type}`;
        params['EMAIL'] = paymentDetails.customerEmail;
        params['MOBILE_NO'] = paymentDetails.customerPhone;
        // params['id'] = req.body.id;
        // params['uid'] = req.body.uid;
        // params['type'] = req.body.type;


        checksum_lib.genchecksum(params, paytmConfig.key, function (err, checksum) {
            var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
            // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

            var form_fields = "";
            for (var x in params) {
                form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
            }
            form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please refresh this page after payment was completed...</h1></center><form method="post" target="_blank" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
            res.end();
        });
    }
});

router.post('/done', async (req, res) => {

    let msg = ''
    res.writeHead(200, { 'Content-Type': 'text/html' });
    if (req.body.STATUS === 'TXN_SUCCESS') {

        const { ORDERID, BANKTXNID, CHECKSUMHASH } = req.body
        const { id, type, uid } = req.query
        let responseTo = (
            (type == 'movie')
                ?
                await moviePurchased(id, uid)
                :
                (
                    (type == 'web')
                        ?
                        await webPurchased(id, uid)
                        :
                        await packPurchased(id, uid)
                )
        )
        await paymentSuccess({
            paymentType: 'paytm',
            item: type,
            itemId: id,
            paymentId: BANKTXNID,
            orderId: ORDERID,
            signature: CHECKSUMHASH
        })
        if (responseTo.success) msg = 'green|Payment Successfull!'
        else msg = 'red|Payment Unsuccessfull'
    } else msg = 'red|Payment Unsuccessfull'

    res.end(` <h3 style="color: ${msg.split('|')[0]};text-align: center;">${msg.split('|')[1]}</h3>
        <script>setTimeout(()=>{ window.close() }, 3000)</script>
    `)
})



module.exports = router
