jQuery(jQuery('td.characterdata.shipmentInformationColumn')[0])


var colToBeCheck = "2773555358866";

var shipInfoCol = jQuery('td.characterdata.shipmentInformationColumn');
for(k in shipInfoCol){
	var poNum = Number(k);
	if(poNum && poNum%5 === 0){
		if(colToBeCheck === jQuery(shipInfoCol[poNum]).text().replace(/\s/g,'')){

		}
		console.log(jQuery(shipInfoCol[poNum]).text().replace(/\s/g,''));
	}
}


var colToBeCheck = "3777255454393";
var evenrow = $('tr.evenrow'), oddrow = $('tr.oddrow');
var secretKeys = {};
var poNum, secretkey;
for(row in evenrow){
	if(typeof evenrow[row] === 'object'){
		poNum = $($(evenrow[row]).find('td')[1]).text().replace(/\s/g,'');
		if(colToBeCheck === $($(evenrow[row]).find('td')[1]).text().replace(/\s/g,'')){
			secretkey = $(evenrow[row]).attr('onclick').toString().match(/\d+/)[0];
			secretKeys[poNum] = secretkey;
		}
	}
}

for(row in oddrow){
	if(typeof oddrow[row] === 'object'){
		poNum = $($(oddrow[row]).find('td')[1]).text().replace(/\s/g,'');
		if(colToBeCheck === $($(oddrow[row]).find('td')[1]).text().replace(/\s/g,'')){
			secretkey = $(oddrow[row]).attr('onclick').toString().match(/\d+/)[0];
			secretKeys[poNum] = secretkey;
		}
	}
}

var _data, _status;
jQuery.ajax({
	url:"/dsm/gotoOrderRealmForm.do",
	data:{
		orderid: secretKeys[colToBeCheck],
		action: "web_ship",
		Go: "Go"
	},
	success:function(data, status){
		// _data = data;
		// _status = status;
		console.log(status);

		var _document = jQuery(jQuery.parseHTML(data));
		var makePostForm = function (_document, _orderID, _itemIDs, _trNums){
			var postForm = {};
			var orderPrefix = 'order('+_orderID+')';
			var orderid = orderPrefix+'.id';
			var shipmentdate = orderPrefix+'.shipmentdate';

			var boxPrefix = orderPrefix+'.box('+(i+1)+')';
			var trackingnumber = boxPrefix+'.trackingnumber';
			var shippingmethod = boxPrefix+'.shippingmethod';
			var ssccid = boxPrefix+'.ssccid';


			postForm[orderid] = _orderID;
			postForm[shipmentdate] = _document.find('input[name="'+shipmentdate+'"]').val();

			for(var i = 0; i < _itemIDs.length; i++){
				

				postForm[trackingnumber] = _trNums[i];
				postForm[shippingmethod] = _document.find('select[name="'+shippingmethod+'"]').val();
				postForm[ssccid] = _document.find('input[name="'+ssccid+'"]').val();

				for(var j = 0; j < _itemIDs.length; j++){
					var itemPrefix = boxPrefix+'.item('+_itemIDs[j]+')';
					var itemid = itemPrefix+'.id';
					var splitLineId = itemPrefix+'.splitLineId';
					var unitcost = itemPrefix+'.unitcost';
					var shipped = itemPrefix+'.shipped';
					var cancelled = itemPrefix+'.cancelled';

					postForm[itemid] = _itemIDs[j];
					postForm[splitLineId] = _itemIDs[j];
					postForm[unitcost] = _document.find('input[name="'+unitcost+'"]').val();
					postForm[shipped] = i==j ? "1" : "";
					postForm[cancelled] = _document.find('input[name="'+cancelled+'"]').val();			

				}
			}
			postForm['confirmbtn'] = 'Submit'
			return postForm;
		};
		var getItemIDs = function(_document){
			var itemIDs = [];
			_document.find('input').each(function(){
				if(jQuery(this).attr('name') && jQuery(this).attr('name').match(/order.*item.*id/)){

					var item_id = jQuery(this).attr('name').replace(/.*item\((\d+).*/, '$1');
					console.log(item_id);

					if(itemIDs.indexOf(item_id)===-1){
						itemIDs.push(item_id);
					}
					console.log(jQuery(this).val());
				}
			});
			return itemIDs;
		};
		var itemIDs = getItemIDs(_document);
		var trNums = ["7067175668"];
		var postForm = makePostForm(_document, secretKeys[colToBeCheck], getItemIDs(_document), ["7067175668"]);

		console.log(postForm);
	}
});



var inputs = jQuery(jQuery.parseHTML(_data)).find('input');

var _document = jQuery(jQuery.parseHTML(_data));
var itemIDs = [];
_document.find('input').each(function(){
	if(jQuery(this).attr('name') && jQuery(this).attr('name').match(/order.*item.*id/)){

		var item_id = jQuery(this).attr('name').replace(/.*item\((\d+).*/, '$1');
		console.log(item_id);

		if(itemIDs.indexOf(item_id)===-1){
			itemIDs.push(item_id);
		}
		console.log(jQuery(this).val());
	}
});


// ----------------------modify version-----------------------
var _document = jQuery(jQuery.parseHTML(_data));
function makePostForm(_orderID, _itemIDs, _trNums){
	var postForm = {};
	var orderPrefix = 'order('+_orderID+')';
	var orderid = orderPrefix+'.id';
	var shipmentdate = orderPrefix+'.shipmentdate';

	postForm[orderid] = _orderID;
	postForm[shipmentdate] = _document.find('input[name="'+shipmentdate+'"]').val();

	for(var i = 0; i < _itemIDs.length; i++){

		var boxPrefix = orderPrefix+'.box('+(i+1)+')';
		var trackingnumber = boxPrefix+'.trackingnumber';
		var shippingmethod = boxPrefix+'.shippingmethod';
		var ssccid = boxPrefix+'.ssccid';

		postForm[trackingnumber] = _trNums[i];
		postForm[shippingmethod] = _document.find('select[name="'+shippingmethod+'"]').val();
		postForm[ssccid] = _document.find('input[name="'+ssccid+'"]').val();

		for(var j = 0; j < _itemIDs.length; j++){
			var itemPrefix = boxPrefix+'.item('+_itemIDs[j]+')';
			var itemid = itemPrefix+'.id';
			var splitLineId = itemPrefix+'.splitLineId';
			var unitcost = itemPrefix+'.unitcost';
			var shipped = itemPrefix+'.shipped';
			var cancelled = itemPrefix+'.cancelled';

			postForm[itemid] = _itemIDs[j];
			postForm[splitLineId] = _itemIDs[j];
			postForm[unitcost] = _document.find('input[name="'+unitcost+'"]').val();
			postForm[shipped] = i==j ? "1" : "";
			postForm[cancelled] = _document.find('input[name="'+cancelled+'"]').val();			

		}
	}
	postForm['confirmbtn'] = 'Submit'
	return postForm;
}

var pf = makePostForm(secretKeys[colToBeCheck], itemIDs, trNums);
//--------------------------------------------------v


var itemIDs = [], boxNum = 0;
jQuery('input').each(function(){
	if(jQuery(this).attr('name') && jQuery(this).attr('name').match(/order.*item.*id/)){

		var item_id = jQuery(this).attr('name').replace(/.*item\((\d+).*/, '$1');
		console.log(item_id);

		if(itemIDs.indexOf(item_id)===-1){
			boxNum += 1;
			itemIDs.push(item_id);
		}
		console.log(jQuery(this).val());
	}
});



function makePostForm(_orderID, _itemIDs, _trNums){
	var postForm = {};
	// postForm['order('+orderID+').id'] = Number(orderID);
	// postForm['order('+orderID+').shipmentdate'] = "12/21/2017";
	var orderPrefix = 'order('+_orderID+')';
	var orderid = orderPrefix+'.id';
	var shipmentdate = orderPrefix+'.shipmentdate';

	postForm[orderid] = _orderID;
	postForm[shipmentdate] = jQuery('input[name='+shipmentdate+']').val();

	for(var i = 0; i < _itemIDs.length; i++){

		var boxPrefix = orderPrefix+'.box('+(i+1)+')';
		var trackingnumber = boxPrefix+'.trackingnumber';
		var shippingmethod = boxPrefix+'.shippingmethod';
		var ssccid = boxPrefix+'.ssccid';


		// asssign tracking# to box1
		postForm[trackingnumber] = _trNums[i];
		postForm[shippingmethod] = jQuery('select[name='+shippingmethod+']').val();
		postForm[ssccid] = jQuery('input[name='+ssccid+']').val();

		for(var j = 0; j < _itemIDs.length; j++){
			var itemPrefix = boxPrefix+'.item('+_itemIDs[j]+')';
			var itemid = itemPrefix+'.id';
			var splitLineId = itemPrefix+'.splitLineId';
			var unitcost = itemPrefix+'.unitcost';
			var shipped = itemPrefix+'.shipped';
			var cancelled = itemPrefix+'.cancelled';

			postForm[itemid] = _itemIDs[j];
			postForm[splitLineId] = _itemIDs[j];
			postForm[unitcost] = jQuery('input[name='+unitcost+']').val();
			postForm[shipped] = i==j ? "1" : "";
			postForm[cancelled] = jQuery('input[name='+cancelled+']').val();			

		}
	}
	return postForm;
}

//1777255447925
var pf = makePostForm("595645394", ["650447043"], ["7067175659"]);


var parseStringToHTML = $('<div>');
parseStringToHTML.parseHTML(_data);


jQuery.ajax({
	type: "POST",
	url: "/dsm/handleOrderRealmFormSubmission.do",
	data: postForm,
	success:function(data, status){
		console.log(data);
		console.log(status);
	}
});

jQuery.ajax({
		url:"/dsm/gotoOrderRealmForm.do",
		data:{
			orderid: "595645394",
			action: "web_ship",
			Go: "Go"
		},
		success:function(data, status){
			_data = data;
			_status = status;
			console.log(data.);
			console.log(typeof(data));
		},
		method: 'GET'
		// ,
		// dataType: "html"
	});
