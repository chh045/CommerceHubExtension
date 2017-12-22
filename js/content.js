$(function(){
   
    function encryptKeys(t){
        var poNum, encrypted_key, encryptedKeys = {}, tds = {};
        var evenrow = $('tr.evenrow'), oddrow = $('tr.oddrow');
        for(row in evenrow){
            if(typeof evenrow[row] === 'object'){
                poNum = $($(evenrow[row]).find('td')[1]).text().replace(/\s/g,'');
                for(po in t){
                    if(po === poNum){
                        encrypted_key = $(evenrow[row]).attr('onclick').toString().match(/\d+/)[0];
                        encryptedKeys[encrypted_key] = t[po];
                        tds[encrypted_key] = $(evenrow[row]).find('td')[1];
                    }
                }
            }
        }
        for(row in oddrow){
            if(typeof oddrow[row] === 'object'){
                poNum = $($(oddrow[row]).find('td')[1]).text().replace(/\s/g,'');
                for(po in t){
                    if(po === poNum){
                        encrypted_key = $(oddrow[row]).attr('onclick').toString().match(/\d+/)[0];
                        encryptedKeys[encrypted_key] = t[po];
                        tds[encrypted_key] = $(oddrow[row]).find('td')[1];
                    }
                }
            }
        }
        return {encryptedKeys: encryptedKeys, tds:tds};
    }

    function makePostForm(_document, _orderID, _itemIDs, _trNums){
        var postForm = {};
        var orderPrefix = 'order('+_orderID+')';
        var orderid = orderPrefix+'.id';
        var shipmentdate = orderPrefix+'.shipmentdate';

        postForm[orderid] = _orderID;
        postForm[shipmentdate] = _document.find('input[name="'+shipmentdate+'"]').val();

        for(var i = 0; i < _itemIDs.length; i++){
            
            var boxBase = orderPrefix+'.box('+(1)+')'; 
            var boxPrefix = orderPrefix+'.box('+(i+1)+')';
            var trackingnumber = boxPrefix+'.trackingnumber';
            var shippingmethod = boxPrefix+'.shippingmethod';
            var ssccid = boxPrefix+'.ssccid';

            postForm[trackingnumber] = _trNums[i] || _trNums[0];
            postForm[shippingmethod] = _document.find('select[name="'+boxBase+'.shippingmethod'+'"]').val();
            postForm[ssccid] = $(_document.find('select[name="'+boxBase+'.ssccid'+'"]').find('option')[i+1]).val();
            console.log();
            console.log(_document.find('select[name="'+boxBase+'.ssccid'+'"]').find('option')[i+1]);
            console.log($(_document.find('select[name="'+boxBase+'.ssccid'+'"]').find('option')[i+1]).val());

            for(var j = 0; j < _itemIDs.length; j++){
                var itemBase = boxBase+'.item('+_itemIDs[j]+')';
                var itemPrefix = boxPrefix+'.item('+_itemIDs[j]+')';
                var itemid = itemPrefix+'.id';
                var splitLineId = itemPrefix+'.splitLineId';
                var unitcost = itemPrefix+'.unitcost';
                var shipped = itemPrefix+'.shipped';
                var cancelled = itemPrefix+'.cancelled';

                postForm[itemid] = _itemIDs[j];
                postForm[splitLineId] = _itemIDs[j];
                postForm[unitcost] = _document.find('input[name="'+itemBase+'.unitcost'+'"]').val();
                postForm[shipped] = i==j ? "1" : "";
                postForm[cancelled] = _document.find('input[name="'+itemBase+'.cancelled'+'"]').val();          

            }
        }
        postForm['confirmbtn'] = 'Submit'
        return postForm;
    }
    function getItemIDs(_document){
        var itemIDs = [];
        _document.find('input').each(function(){
            if(jQuery(this).attr('name') && jQuery(this).attr('name').match(/order.*item.*id/)){

                var item_id = jQuery(this).attr('name').replace(/.*item\((\d+).*/, '$1');
                // console.log(item_id);

                if(itemIDs.indexOf(item_id)===-1){
                    itemIDs.push(item_id);
                }
                // console.log(jQuery(this).val());
            }
        });
        return itemIDs;
    }

    function closeTrackings(epo){
        for(po in epo){
            jQuery.ajax({
                url:"/dsm/gotoOrderRealmForm.do",
                data:{
                    orderid: po,
                    action: "web_ship",
                    Go: "Go"
                },
                success:function(data, status){
                    console.log(status);
                    var _document = jQuery(jQuery.parseHTML(data));
                    var itemIDs = getItemIDs(_document);
                    var postForm = makePostForm(_document, po, getItemIDs(_document), epo[po]);
                    console.log(postForm);
                }
            });
        }
    }

    $(document).ready(()=>{
        console.log("CommerceHub extension activated");
        /*-----------------------------------------------------*/

        chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
            var package = request.path.split('/'),
                path    = package[0],
                type    = package[1], 
                data    = request.data;
            if(path === "content"){
                if(type === "close-tracking"){
                    console.log('data.trackings:', data.trackings);
                    console.log('data.trackings.size:', Object.keys(data.trackings).length);
                    console.log('encrypted.trackings:', encryptKeys(data.trackings));
                    // console.log('encrypted.trackings.size:', Object.keys(encryptKeys(data.trackings)).length)
                    closeTrackings(encryptKeys(data.trackings));
                    sendResponse({success: true});
                }
            }
            return true; 
        }); 
    });
});
