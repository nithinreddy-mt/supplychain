/*
	this function is simply changing the ownership from one person to another person.
    The transaction we defined in the model.cto file is below
    transaction TransferOwnership {
		  --> Product product
		  --> SupplyChainMember newOwner
	}
    Now our job it to make use of the transaction data and change the ownership of the product mentioned in the      transaction

*/


/* global getAssetRegistry getFactory emit */
/**
 * Sample transaction processor function.
 * @param {org.supplychain.basic.TransferOwnership} tx The sample transaction instance.
 * @transaction
 */

// above comments are compulsory, tx is of type org.supplychain.basic.TransferOwnership, defined in above comments
async function transferOwnerShip(tx) {  // eslint-disable-line no-unused-vars

    //tx is of type "TransferOwnership", which i actually a transaction.
  	// if u refer to the transaction definition above, it has a property product, where product is a asset type
    //defined in model file. This product is of type Product, which has a property called owner. Our job is to change
    //this owner to the new owner which is given in the txn.
  
    // Save the old owner of the product. 
    const oldOwner = tx.product.owner;

    
    // getAssetRegistry is an in built function, check the line we defined in comment above the function
  	// Get the asset registry for the product. Asset registry is maintained by the hyperledger framework, think of it
  	// as a data store where our data is getting stored.
  	// we got the asset registry for our Product type which we defined in the model file.
  	// this line is common for all types of assets, just need to change the parameter passed to  getAssetRegistry
    const assetRegistry = await getAssetRegistry('org.supplychain.basic.Product');
    
  	
  	// Update the product with the new owner
    tx.product.owner = tx.newOwner;
  	// Update the product in the asset registry, we need to save the product object back to the data store
    await assetRegistry.update(tx.product);

    // Emit an event for the modified product.
    let event = getFactory().newEvent('org.supplychain.basic', 'OnwerShipTransferedEvent');
    event.product = tx.product;
    event.oldOwner = oldOwner;
    event.newOwner = tx.newOwner;
    // emit is a javascript function which is used to emit events, we can catch these event's and call other functions
    // u can ignore this u dont need this as of now, if needed ill explain it again.
    emit(event);
}
