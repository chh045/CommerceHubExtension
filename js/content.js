$(function(){
   
    function encryption(t){
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
        return {epo:encryptedKeys, tds:tds};
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
            postForm[ssccid] = $(_document.find('select[name="'+boxBase+'.ssccid'+'"]').find('option')[i+1]).val() || "";

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
        var orderid;
        _document.find('input').each(function(){
            if(jQuery(this).attr('name') && jQuery(this).attr('name').match(/order.*item.*id/)){
                var ord_item = jQuery(this).attr('name').replace(/.*order\((\d+).*item\((\d+).*/, '$1,$2').split(',');
                if(itemIDs.indexOf(ord_item[1])===-1){
                    itemIDs.push(ord_item[1]);
                }
                if(!orderid){
                    orderid = ord_item[0];
                }
            }
        });
        return {po:orderid, items:itemIDs};
    }

    function closeTrackings(encrypted_info){
        var epo = encrypted_info.epo;
        var tds = encrypted_info.tds;
        console.log(epo);
        console.log(tds);
        for(po in epo){
            jQuery.ajax({
                url:"/dsm/gotoOrderRealmForm.do",
                data:{
                    orderid: po,
                    action: "web_ship",
                    Go: "Go"
                },
                success:function(data, status){
                    // console.log(status);
                    var _document = jQuery(jQuery.parseHTML(data));
                    var _o = getItemIDs(_document);
                    // var itemIDs = getItemIDs(_document);
                    var postForm = makePostForm(_document, _o.po, _o.items, epo[_o.po]);
                    console.log(postForm);
                    $(tds[_o.po]).append('<span><img src="chrome-extension://ielbipaagjlhndhcknfipcgbekhjkjga/src/Check_icon.png" width="15px"></span>');

                    jQuery.ajax({
                        type: "POST",
                        url: "/dsm/handleOrderRealmFormSubmission.do",
                        data: postForm,
                        success:function(data, status){
                            // console.log(data);
                            console.log(data, status);
                        }
                    });
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
                    // console.log('data.trackings:', data.trackings);
                    // console.log('data.trackings.size:', Object.keys(data.trackings).length);
                    var en = encryption(data.trackings);
                    var epo = en.epo;
                    var tds = en.tds;
                    console.log('encrypted.trackings:', en);
                    // console.log('encrypted.trackings.size:', Object.keys(encryptKeys(data.trackings)).length)
                    closeTrackings(en);
                    sendResponse({success: true});
                }
            }
            return true; 
        }); 
    });
});
