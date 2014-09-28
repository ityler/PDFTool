function sendFile(formData,status){
    var uploadURL ="inc/upload.php"; //Upload URL
    var jqXHR=$.ajax({
            xhr: function(){
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload){
                    xhrobj.upload.addEventListener('progress', function(event) {
                        var percent = 0;
                        var position = event.loaded || event.position;
                        var total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                        }
                        //Set progress
                        status.setProgress(percent);
                    }, false);
                }
            return xhrobj;
        },
    url: uploadURL,
    type: "POST",
    contentType:false,
    processData: false,
        cache: false,
        data: formData,
        success: function(data){
            status.setProgress(100);
          //  $("#status").append("File upload Done<br>");
        }
    }); 
 
    status.setAbort(jqXHR);
}
 
var rowCount=0;
function createStatusbar(obj){
     rowCount++;
     var row="odd";
     if(rowCount %2 ==0) row ="even";
     this.statusbar = $("<div class='statusbar "+row+"'></div>");
     this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
     this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
     this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
     this.abort = $("<div class='abort'>Abort</div>").appendTo(this.statusbar);
     obj.after(this.statusbar);
 
    this.setFileNameSize = function(name,size){
        var sizeStr="";
        var sizeKB = size/1024;
        if(parseInt(sizeKB) > 1024){
            var sizeMB = sizeKB/1024;
            sizeStr = sizeMB.toFixed(2)+" MB";
        }
        else{
            sizeStr = sizeKB.toFixed(2)+" KB";
        }
 
        this.filename.html(name);
        this.size.html(sizeStr);
    }
    this.setProgress = function(progress){       
        var progressBarWidth =progress*this.progressBar.width()/ 100;  
        this.progressBar.find('div').animate({ width: progressBarWidth }, 10).html(progress + "% ");
        if(parseInt(progress) >= 100)
        {
            this.abort.hide();
        }
    }
    this.setAbort = function(jqxhr){
        var sb = this.statusbar;
        this.abort.click(function()
        {
            jqxhr.abort();
            sb.hide();
        });
    }
}
function handleFileUpload(files,obj){
   for (var i = 0; i < files.length; i++) 
   {
        var fd = new FormData();
        fd.append('file', files[i]);
 
        var status = new createStatusbar(obj); //Using this we can set progress.
        status.setFileNameSize(files[i].name,files[i].size);
        sendFile(fd,status);
 		uplFls.push(files[i].name);			// Add filename to array
 		combineChk(uplFls);
   }
}

function combineChk(files){
	var fc = 0;
	for (var i = 0; i < files.length; i++) {
    	console.log(files[i]);
		fc++;
	}
	if (fc >= 2){
		$("#cmb").removeAttr('disabled');			// Remove disable on button
	}
}

// Combine multiple PDFs
function cmbPDF(fl){
	$("#loading").show();
	var uploadURL ="inc/cmb.php"; //Upload URL
    var jqXHR = $.ajax({
        xhr: function() {
        	var xhrobj = $.ajaxSettings.xhr();
            return xhrobj;
        },
    type: "POST",
    url: uploadURL,
    data: {
    	filenames: fl,
    },
    success: function(data){
    	$("#loading").hide();
        console.log(data);
        var outFn = "outfile.pdf";
        showCmb(outFn);
        downloadFile("inc/files/outfile.pdf");
    }
}); 
 
   // status.setAbort(jqXHR);
}

// Show new combined PDF file
function showCmb(fn){
	var out = $('#status');
	$(out).append("<button class='btn btn-success'><a href='inc/files/outfile.pdf' \
		download='combined.pdf'>Download Combined PDF</a></button>");
}

function downloadFile(url, success){
    var xhr = new XMLHttpRequest(); 
    xhr.open('GET', url, true); 
    xhr.responseType = "file";
    xhr.onreadystatechange = function () { 
        if (xhr.readyState == 4) {
            if (success) success(xhr.response);
        }
    };
    xhr.send(null);
    console.log("downloadFile");
}

var uplFls = [];			// store uploaded filenames
var cmbFlg = 0;
$(document).ready(function(){
	$("#cmb").attr('disabled','disabled');
	var obj = $("body");
	var stat = $("#filestats");
	obj.on('dragenter', function (e){
		console.log("dragenter");
    	e.stopPropagation();
    	e.preventDefault();
    //	$(this).css('border', '2px solid #0B85A1');
	});
	obj.on('dragover', function (e){
    	console.log("dragover");
    	e.stopPropagation();
     	e.preventDefault();
	});

	obj.on('drop', function (e){
    	console.log("drop");
    	//$(this).css('border', '2px dotted #0B85A1');
    	e.preventDefault();
    	var files = e.originalEvent.dataTransfer.files;
     	handleFileUpload(files,stat);
	});
	$(document).on('dragenter', function (e){
		console.log("on dragenter");
    	e.stopPropagation();
    	e.preventDefault();
	});
	$(document).on('dragover', function (e){
  		console.log("on dragover");
  		e.stopPropagation();
  		e.preventDefault();
  	//	obj.css('border', '2px dotted #0B85A1');
	});
	$(document).on('drop', function (e){
    	console.log("on drop");

    	e.stopPropagation();
    	e.preventDefault();
	});

	// Combine PDF click handler
	$("#cmb").click(function(){
		var fcs = "";
		$("div.filename").each(function(){
			fcs += "||" + $(this).text();
		});
		console.log(fcs);
        cmbPDF(fcs);
	});
});