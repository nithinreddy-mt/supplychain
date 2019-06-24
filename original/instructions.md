setup function error free code --> https://github.com/ovaiskale/supplychain/tree/master/original <br />
Changes made -> Inside setupDemo funciton removed the shipment creation and contract creation. <br />
It was having error's in the way the contract was being created. For now test this function it will work fine. <br /> <br />

Note: Most of the inputs are actually filled in by default by the playground UI. <br /> <br /> 
Steps, imagine we are procuring wheat, manufacturing maggi, sending it to distributor: <br /><br />
1)First  in the test tab, **run the setUpDemo transaction**, it will create all the actors. check in the left side for various actors in system, check the data and the identifiers.
<br /><br />
2) **Now create a new commodity in the assets sub section**, notice the owner field. Other fields I chose random values
<br />
```
{
  "$class": "org.logistics.testnet.Commodity",
  "type": "FOOD",
  "GTIN": "5477",
  "name": "Wheat",
  "description": "wheat flour",
  "itemCondition": {
    "$class": "org.logistics.testnet.ItemCondition",
    "conditionDescription": "very good",
    "status": "GOOD"
  },
  "owner": "resource:org.logistics.testnet.Supplier#supplier@email.com"
}
```
<br />
3) __Now create the contract and shipment using CreateShipmentAndContract__ after this step check the OrderContract and ShipmentBacth assets, new ones will be created <br /><br />

**Notice the owner and buyer field**, i had plugged in values from existing supplier and manufacturer records, created by setupDemo txn above. <br /><br />
**Notice the expectedArrivalLocation** (manufacturer’s address UK )and **location**(suppliers address -  USA). <br /><br />
**Notice assetExchanged** - filled  in with the commodity id created earlier<br /><br />

```
{
    "$class": "org.logistics.testnet.CreateShipmentAndContract",
    "shipmentId": "1",
    "trackingNumber": "1",
    "message": "supplying wheat",
    "status": "WAITING",
    "location": {
        "$class": "org.logistics.testnet.Location",
        "globalLN": "1",
        "address": {
            "$class": "org.logistics.testnet.Address",
            "country": "USA"
        }
    },
    "owner": "resource:org.logistics.testnet.Supplier#supplier@email.com",
    "assetExchanged": [
        "resource:org.logistics.testnet.Commodity#5477"
    ],
    "orderId": "1",
    "buyer": "resource:org.logistics.testnet.Manufacturer#manufacturer@email.com",
    "expectedArrivalLocation": {
        "$class": "org.logistics.testnet.Location",
        "globalLN": "2",
        "address": {
            "$class": "org.logistics.testnet.Address",
            "country": "UK"
        }
    },
    "payOnArrival": false,
    "arrivalDateTime": "2019-06-30T04:43:05.693Z",
    "paymentPrice": 0
}
```
