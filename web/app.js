$(document).ready(function() {

	var servers = {
    "test1": "http://localhost:3000",
    //"test2": "http://localhost:3000",
    //"test3": "http://localhost:3000"
  };


  $.each(servers, function( key, value ) {
    connect(key, value);
    create_box(key);
  });
});

function create_box(name) {
  $('#servers').append(`
      <div class="col-md-2">
        <div class="panel panel-info">
          <div class="panel-heading">
            <div class="row">
              
              <div class="col-md-9">
                <div style="margin-top:-10px; margin-bottom:-10px;">
                  <b><p class="panel-title" id="hostname${name}"></p></b>
                </div>
              </div>
              
              <div class="col-md-3">
                <div style="margin-top:-10px; margin-bottom:-10px;">
                  <div id="status${name}"></div>
                </div>
              </div>

            </div>
          </div>

          <div id="panel${name}" class="panel-body">
                       
            <div class="row">
              <div class="col-md-4">cpu</div>
              <div class="col-md-4">ram</div>
              <div class="col-md-4"><center>/</center></div>
            </div>
            <div class="row">

              <div class="col-md-4">
                <div class="progress progress-bar-vertical">
                    <div id="progressCPU${name}" class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                      <span id="cpu${name}" class="label label-default"></span>
                    </div>
                  </div>
              </div>

              <div class="col-md-4">
                <div class="progress progress-bar-vertical">
                    <div id="progressRAM${name}" class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                      <span id="ram${name}" class="label label-default"></span>
                    </div>
                  </div>
              </div>

              <div class="col-md-4">
                <div class="progress progress-bar-vertical">
                    <div id="progressDISK${name}" class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                      <span id="disk${name}" class="label label-default"></span>
                    </div>
                  </div>
              </div>
              
            </div>
            <h3 style="text-align:center; margin-top:-15px;" id="timer${name}"></h3> 
          </div>
        </div>
      </div>
`);
}



function connect(name, server) {
  this.socket = io(server); //connect to socket

  setInterval(function() {
    if(this.socket.disconnected) {
      $('#status'+name).empty();
      $('#status'+name).append("<a class='btn btn-danger'></a>"); 
    }else {
      $('#status'+name).empty();
      $('#status'+name).append(`<button id='modal-button${name}' type='button' class='btn btn-success' data-toggle='modal' data-target='.advanced-modal'></button>`);
    }
  },1000);

  this.socket.on('hostname', function(data) { 
    $('#hostname'+name).text(data);
  });


  this.socket.on('current_ram', function(data) { 
    $('#current_ram'+name).text(data +" / ");
  });

  this.socket.on('total_ram', function(data) { 
    $('#total_ram'+name).text(data +"MB");
  });

  this.socket.on('uptime', function(data) {
    $('#timer'+name).text(toHHMMSS(data));
  });
  
  this.socket.on('current_cpu', function(data) {
    server_bars('#progressCPU'+name, data);
    $('#cpu'+name).text(data +"%");
  });

  this.socket.on('current_ram_percentage', function(data) {
    server_bars('#progressRAM'+name, data);
    $('#ram'+name).text(data +"%");
  });

  this.socket.on('disk_percentage', function(data) {
    if($('#disk_selected'+name).text() === "") {
      $('#disk_selected'+name).text("/");
    }
    server_bars('#progressDISK'+name, data.disk_percentage);
    $('#disk'+name).text(data.disk_percentage +"%");
  });


    this.socket.on('all_disks', function(data) { //porcentaje de todos los discos al modal
      $('#advanced-content').empty();
      $.each(data, function( key,value ) {
        $('#advanced-content').append(`
          <h3>${key}</h3>
          <p>${value.percent}</p>  
        `);   
      });
    });
  

}

function toHHMMSS(secs) {
    var sec_num = parseInt(secs, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

function change_disk_selected(selector, val) {
  $(selector).empty();
  $(selector).append(val);
}



      /*
      $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
      });
      */

function server_bars(selector, percent) {
	if(percent <= 100) {
		$(selector).css('height', percent+'%');
		if (percent < 50) {
			$(selector).switchClass("progress-bar-warning", "progress-bar-success", 1000 );		
		}else if (percent >= 50 && percent < 80) {
			$(selector).switchClass("progress-bar-success", "progress-bar-warning", 1000 );
		    $(selector).switchClass("progress-bar-danger", "progress-bar-warning", 1000 );
		}else if (percent > 80) {
			$(selector).switchClass("progress-bar-warning", "progress-bar-danger", 1000 );
		}
	}
}