/* global getParticipantRegistry getAssetRegistry getFactory emit */


function isStockAvailable(seller, txn) {
    var txnItems = txn.shipment.stock;
    for (let i = 0; i < txnItems.length; i++) {
        var txnItem = txnItems[i];
        var found = false;
        for (let j = 0; j < seller.items.length; j++) {
            var sellerItem = seller.items[j];
            if (txnItem.itemId == sellerItem.itemId) {
                if (txnItem.quantity <= sellerItem.quantity) {
                    found = true;
                }
            }
        }
        if (found == false) {
            return false;
        }
    }
    return true;
}

function deductStockFromTheSeller(seller, txn) {
    var txnItems = txn.shipment.stock;
    for (let i = 0; i < txnItems.length; i++) {
        var txnItem = txnItems[i];
        for (let j = 0; j < seller.items.length; j++) {
            if (txnItem.itemId == seller.items[j].itemId) {
                seller.items[j].quantity = seller.items[j].quantity - txnItem.quantity;
            }
        }
    }
    return seller;
}

function addStockToTheBuyer(buyer, txn) {
    var txnItems = txn.shipment.stock;
    for (let i = 0; i < txnItems.length; i++) {
        var txnItem = txnItems[i];
        var itemFoundAt = -1;
        for (let j = 0; j < buyer.items.length; j++) {
            if (txnItem.itemId == buyer.items[j].itemId) {
                itemFoundAt = j;
            }
        }
        if(itemFoundAt == -1){
            const factory = getFactory();
            const stockItem = factory.newConcept(NAME_SPACE, 'Stock');
            stockItem.itemId = txnItem.itemId;
            stockItem.quantity = txnItem.quantity;
            buyer.items.push(stockItem);
        } else {
            buyer.items[itemFoundAt].quantity = buyer.items[itemFoundAt].quantity + txnItem.quantity;
        }
    }
    return buyer;
}


async function checkIfParticipantExists(participantRegistry, member){
    var exists = await participantRegistry.exists(member.getIdentifier());
    return exists;
}

async function getParticipant(participantRegistry, member) {
    if(member == undefined || member == null) {
        throw "input member is invalid, given input member =" + member;
    }
    var exists = await checkIfParticipantExists(participantRegistry, member);
    if(exists == true) {
        var participant = await participantRegistry.get(member.getIdentifier());
        return participant;
    } else {
        throw member.getType() + " not found with given id = " + member.getIdentifier();
    }
    
}

const NAME_SPACE = 'org.supplychain.basic';

async function getMemberRegistry(member){
    const registry = await getParticipantRegistry(NAME_SPACE + '.' + member.getType());
    return registry
}
/**
 * 
 * @param {org.supplychain.basic.SellRawMaterialToManufacturer} tx The sample transaction instance.
 * @transaction
 */
async function SellRawMaterialToManufacturer(tx) { // eslint-disable-line no-unused-vars
    try {
        const ShipmentRegistry = await getAssetRegistry(NAME_SPACE + '.Shipment');
        const SupplierRegistry = await getParticipantRegistry(NAME_SPACE + '.Supplier');
        const ManufacturerRegistry = await getParticipantRegistry(NAME_SPACE + '.Manufacturer');
        var supplier = await getParticipant(SupplierRegistry, tx.seller)
        var manufacturerExists = await checkIfParticipantExists(ManufacturerRegistry, tx.buyer);
        if(manufacturerExists == false) {
            throw "Manufacturer not found with given id, id = " + tx.buyer
        }
        
        // check if the stock is avaiable
        var isAvailable = isStockAvailable(supplier, tx)
        if(isAvailable == false){
            throw "Required quantity not found with the seller, check the seller's stock and the requirement of the SellRawMaterialToManufacturer txn";
        }
        // reduce the stock from the seller
        supplier = deductStockFromTheSeller(supplier, txn)
        tx.shipment.seller = tx.seller;
        tx.shipment.buyer = tx.buyer;
        tx.shipment.status = "IN_TRANSIT";
        //adding new shipment object to registry/storage
        await ShipmentRegistry.add(tx.shipment)
        //adding the supplier object in registry/storage, since we deducted the quantity from supplier
        await SupplierRegistry.update(supplier)
    } catch (error) {
        console.log("SellRawMaterialToManufacturer error", error, tx);
        throw error;
    }
}

/**
 * 
 * @param {org.supplychain.basic.AcknowledgeShipmentDelivery} tx The sample transaction instance.
 * @transaction
 */
async function AcknowledgeShipmentDelivery(tx) { // eslint-disable-line no-unused-vars
    if(tx.shipment.buyer.getIdentifier() != tx.acknowledgedBy.getIdentifier()){
        throw "acknoledgement can be done  only by the owner of the shipment"
    }
    const assetRegistry = await getAssetRegistry(NAME_SPACE+ '.Shipment');
    tx.shipment.status = "DELIVERED";
    // add up to the stock
    var buyerRegistry = await getMemberRegistry(tx.shipment.buyer);
    var buyer = await getParticipant(buyerRegistry, tx.shipment.buyer)
    buyer = addStockToTheBuyer(buyer, tx);
    await buyerRegistry.update(buyer);
    await assetRegistry.update(tx.shipment);
}


/**
 * 
 * @param {org.supplychain.basic.SellProductToDistributor} tx The sample transaction instance.
 * @transaction
 */
async function SellProductToDistributor(tx) { // eslint-disable-line no-unused-vars

}

/**
 * 
 * @param {org.supplychain.basic.SellProductToRetailer} tx The sample transaction instance.
 * @transaction
 */
async function SellProductToRetailer(tx) { // eslint-disable-line no-unused-vars

}

/**
 * 
 * @param {org.supplychain.basic.SellProductToCustomer} tx The sample transaction instance.
 * @transaction
 */
async function SellProductToCustomer(tx) { // eslint-disable-line no-unused-vars

}

/**
 * 
 * @param {org.supplychain.basic.ReportShipmentLost} tx The sample transaction instance.
 * @transaction
 */
async function ReportShipmentLost(tx) { // eslint-disable-line no-unused-vars
    // const assetRegistry = await getAssetRegistry(NAME_SPACE+ '.Shipment');
    // tx.shipment.status = "LOST";
    // await assetRegistry.add(tx.shipment);
}
