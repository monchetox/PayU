POS.setEnvironment("test");

POS.initSecureFields('card-secure-fields');

document 
.getElementById('payment-form')
.addEventListener(
   'submit', function (event) 
   {
      event.preventDefault();
      var name = document.getElementById("cardholder-name").value;
      var email = document.getElementById("email").value;
      var phone = document.getElementById("phone").value;
      var country = document.getElementById("country").value;
      var city = document.getElementById("city").value;
      var line1 = document.getElementById("address").value;
      var product = 
      {
         amount: 10000000, 
         currency: "COP", 
         statement_soft_descriptor: "Test" 
      }
      const additionalData = 
      {
         holder_name: name, 
         billing_address: 
         { 
            email: email,
            phone: phone,
            country: country,
            city: city,
            line1: line1
         }
      }
      POS.createToken(
         additionalData, function (result) 
         {
            result = JSON.parse(result);
            console.log(result);
            fetch("https://api.paymentsos.com/payments", 
               {
                  method: "POST",
                  headers: 
                     {
                        "app_id": "com.github.business_unit_test_2",
                        "private_key": "61ddea07-350f-409d-8bb0-06695f76ed51",
                        "Content-Type": "application/json",
                        "api-version": "1.3.0",
                        "x-payments-os-env": "test",
                        "idempotency_key": `${Math.round(Math.random()*15*10000)}-a`,
                     },
                  body: JSON.stringify(product),
               }
            )
            .then((response) => response.json())
            .then(
               (payment) => 
               {
                  console.log(payment);
                  var data_authorize = 
                  {
                     payment_method: 
                     {
                        type: "tokenized",
                        token: `${result["token"]}`,
                        credit_card_cvv: `${result["encrypted_cvv"]}`,
                     },
                     reconciliation_id: `${Math.round(Math.random()*15*10000)}-a`,
                  };
                  fetch(`https://api.paymentsos.com/payments/${payment["id"]}/authorizations`, 
                     {
                        method: "POST",
                        headers: 
                        {
                           "app_id": "com.github.business_unit_test_2",
                           "private_key": "61ddea07-350f-409d-8bb0-06695f76ed51",
                           "Content-Type": "application/json",
                           "api-version": "1.3.0",
                           "x-payments-os-env": "test",
                           "idempotency_key": `${Math.round(Math.random()*15*10000)}-a`,
                        },
                        body: JSON.stringify(data_authorize),
                     }
                  )
                  .then(
                     (response) => response.json())
                     .then((auth) => 
                     {
                        console.log(auth);
                        fetch(`https://api.paymentsos.com/payments/${payment["id"]}/captures`, 
                           {
                              method: "POST",
                              headers: 
                              {
                                 "app_id": "com.github.business_unit_test_2",
                                 "private_key": "61ddea07-350f-409d-8bb0-06695f76ed51",
                                 "Content-Type": "application/json",
                                 "api-version": "1.3.0",
                                 "x-payments-os-env": "test",
                                 "idempotency_key": `${Math.round(Math.random()*15*10000)}-a`,
                              },
                              body: "",
                           }
                        )
                        .then((response) => response.json())
                        .then(
                           (capture) => 
                           {
                              console.log(capture);
                              fetch(`https://api.paymentsos.com/payments/${payment["id"]}/refunds`, 
                                 {
                                    method: 'POST',
                                    headers: 
                                    {
                                       "app_id": "com.github.business_unit_test_2",
                                       "private_key": "61ddea07-350f-409d-8bb0-06695f76ed51",
                                       "Content-Type": "application/json",
                                       "api-version": "1.3.0",
                                       "x-payments-os-env": "test",
                                       "idempotency_key": `${Math.round(Math.random() * 15 * 10000)}-d`,
                                    },
                                 }
                              )
                              .then((response) => response.json())
                              .then(
                                 (refund_r) => 
                                 {
                                    console.log(refund_r);
                                 }
                              ).catch((err) => console.log(err));
                           }
                        ).catch((err) => console.log(err));
                     }
                  ).catch((err) => console.log(err));
               }
            ).catch((err) => console.log(err));
         }
      );
   }
);
