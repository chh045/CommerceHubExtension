$(document).ready(()=>{
    var dimension, timeframe,
    LTL, UPS,
    trackings = {},
    sendDataToTab = function(data, callback){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, data, callback);
        });
    },
    onload = function(){
        var $modal = $('.js-loading-bar'),
            $bar = $modal.find('.progress-bar');
        $modal.modal('show');
        timeframe = setInterval(function(){
            $bar.toggleClass('animate');
        }, 1500);
    },
    offload = function(){
        var $modal = $('.js-loading-bar'),
            $bar = $modal.find('.progress-bar');
        clearInterval(timeframe);
        $bar.removeClass('animate');
        $modal.modal('hide');
    },
    showRed = function(selector, text){
        $(selector).css("color", "#e60000");
        $(selector).text(text);
        $(selector).show();
    },
    showGreen = function(selector, text){
        $(selector).css("color", "#00cc00");
        $(selector).text(text);
        $(selector).show();
    }

    $(document).on('change', ':file', function(){
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    $(':file').on('fileselect', function(event, numFiles, label) {
        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        $('#file-modal-submit').prop('disabled', false);
        $('#file-modal-dimension').prop('disabled', false);

        if(input.length){
            input.val(log); 
        }
        else if(log){
            alert(log);
        }
    });

    $('.js-loading-bar').modal({
        backdrop: 'static',
        show: false
    });


    $('#file-modal-submit').on('click', function(){
        var myFile = $('#fileinput').prop('files')[0];
        var fileReader = new FileReader();
        fileReader.onload = (fileLoadedEvent)=>{
            var textFromFileLoaded = fileLoadedEvent.target.result;
            var lines = fileLoadedEvent.target.result.split('\n');
            lines.forEach((line)=>{
                // var po_so = line.trim().split(/\s+/);
                // console.log('checkline:', checkLine(line), po_so);
                if(checkLine(line)){
                    var tr_po = line.trim().split(/\s+/);
                    if(trackings[tr_po[1]]){
                        trackings[tr_po[1]].push(tr_po[0]);
                    } else {
                        trackings[tr_po[1]] = [tr_po[0]];
                    }
                }

                // pos[po_so[0]] = po_so[1];
            });
            console.log(trackings);
            onload();
            sendDataToTab({
                path: "content/close-tracking",
                data: {
                    trackings: trackings
                }
            }, (response)=>{
                offload();
                if(!response){
                    showRed('#popup-info1', "Error dectected");
                }
                else if(response.success){
                    showGreen("#popup-info1", "encrypted tracking pos.");
                }
            });

        }
        fileReader.readAsText(myFile);
    });


    $('#file-modal').on('show.bs.modal', function(event){
        $('.modal-btn').hide();
        console.log(event);
        console.log("show");
        var button = $(event.relatedTarget);
        var modal = $(this);
        switch(button.data('type')){
            case "upload":
                modal.find('.modal-title').html('upload  <strong>Tracking Report</strong> text file');
                $('#file-modal-submit').show();
                break;
        }
    });

    function checkLine(line){
        var parts = line.trim().split(/\s+/);

        if(parts.length<3){
            return false;
        }
        if(!parts[0].match(/^[0-9]+$/)){
            return false;
        }
        for(var i = 1; i < parts.length; i++){
            if(!parts[i].match(/^[a-z0-9]+-?[a-z0-9]+$/i)){
                return false;
            }
        }
        return true;
    }

    function checkValidString(s){
        if(s.match(/^[a-z0-9]+-?[a-z0-9]+$/i)){
            return true;
        }
        return false;
    }





});



    