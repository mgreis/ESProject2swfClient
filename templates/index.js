//Author: mgreis@student.dei.uc.pt



function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}





var JobBox = React.createClass({
  loadJobsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleJobSubmit: function(job) {
      var jobs = this.state.data;
      job.job_id = Date.now();
      var newJobs = jobs.concat([job]);
      this.setState({data: newJobs});
      $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: job,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: jobs});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
    handleJobDelete: function(job) {
        //window.alert(job.job_id.toString())
      $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'delete',
      data: job,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadJobsFromServer();
    setInterval(this.loadJobsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="jobBox">
        <h1>Jobs</h1>
        <JobForm onJobSubmit={this.handleJobSubmit} />
          <JobAboutForm/>
          <br/>
          <br/>
        <JobList data = {this.state.data} onJobDelete = {this.handleJobDelete} />

      </div>
    );
  }
});

var JobList = React.createClass({
  render: function() {
      var onJobDelete   = this.props.onJobDelete;

    var jobNodes = this.props.data.map(function(job) {
      return (
        <Job  key           = {job.job_id}
              job_id        = {job.job_id}
              job_state     = {job.job_state}
              job_submitted = {job.job_submitted}
              job_started   = {job.job_started}
              job_finished  = {job.job_finished}
              job_file      = {job.job_file}
              onJobDelete   = {onJobDelete}

        >
        </Job>
      );
    });
      var divstyle = {position: 'fixed', left : '23%', top: '10%', overflow:'auto', height: '90%', width: '60%'};
    return (
      <div className="JobList" style = {divstyle}>
          {jobNodes}
      </div>
    );
  }
});

var Job = React.createClass({


  render: function() {
      var submitted = timeConverter(this.props.job_submitted);
      if (this.props.job_started.indexOf("-1")==-1)var started = timeConverter(this.props.job_started);
      else started = "Not Yet!";
      if (this.props.job_finished.indexOf("-1")==-1)var finished = timeConverter(this.props.job_finished)
        else finished = "Not Yet!";

      var onJobDelete   = this.props.onJobDelete;
      var divstyle = {border: '1px solid black',  width : '800px',background: '#00FF66'};
      if (this.props.job_state.indexOf("started")!=-1) {
        divstyle = {border: '1px solid black',  width : '800px',  background: '#FFFF66'};
      }
      if (this.props.job_state.indexOf("submitted")!=-1) {
        divstyle = {border: '1px solid black',  width : '800px', background: '#FF0033', color: 'white'};
      }




         if (this.props.job_state.indexOf("finished")!=-1){
             return (
             <div className="job" style = {divstyle}>
                 <br/>
                 <p className="jobAuthor">
                     id: {this.props.job_id}<br/>
                     State: {this.props.job_state}<br/>
                     Submitted on: {submitted}<br/>
                     Started on: {started}<br/>
                     Finished on: {finished}<br/>
                     File name: {this.props.job_file}<br/><br/>
                 </p>
                 <DeleteJobForm onJobDelete={onJobDelete} job_id={this.props.job_id} job_file={this.props.job_file}/>
             </div>
             );
         }
      else{
             return(
             <div className="job"style = {divstyle}>
                 <br/>
                 <p className="jobAuthor" >
                     id: {this.props.job_id}<br/>
                     State: {this.props.job_state}<br/>
                     Submitted on: {submitted}<br/>
                     Started on: {started}<br/>
                     Finished on: {finished}<br/>
                     File name: {this.props.job_file}<br/><br/>
                 </p>
                 <br/>
             </div>
             );
         }


  }
});

var JobForm = React.createClass({
  getInitialState: function() {
      return {job_id: '-1', job_state: 'submitted', job_submitted : '-1', job_started: '-1', job_finished:'-1', job_file:'-1'};
  },
  handleSubmit: function(e) {
      //window.alert('hellosubmit');
      e.preventDefault();
      var job_submitted = Date.now().toString().trim();

      if (!job_submitted) {
          return;
      }
      this.props.onJobSubmit({job_id: '-1', job_state: 'submitted', job_submitted : job_submitted , job_started: '-1', job_finished:'-1', job_file:'-1'});
      this.setState({job_id: '-1', job_state: 'submitted', job_submitted : '-1', job_started: '-1', job_finished:'-1', job_file:'-1'});
  },
    render: function() {
        var buttonstyle ={position: 'fixed', left : '5%', top: '20%',height: '5%', width: '10%', background : '#4CAF50', color: 'white', border: '1px solid black', cursor: 'pointer'}


        return (
            <form className="jobForm" onSubmit={this.handleSubmit}>
                <input type="submit" value="POST JOB" style = {buttonstyle}/>
            </form>
        );
    }
});

var DeleteJobForm = React.createClass({
  getInitialState: function() {
      var job_id = this.props.job_id.toString().trim();
      var job_file = this.props.job_file.toString().trim();
      return {job_id: {job_id},job_file: {job_file}};
  },
  handleSubmit: function(e) {
      e.preventDefault();
      var job_id = this.props.job_id.toString().trim();
      var job_file = this.props.job_file.toString().trim();
      this.props.onJobDelete({job_id: job_id, job_file: job_file});
      //window.alert(job_id)
      this.setState({job_id: {job_id},job_file:job_file});
  },
    render: function() {
        var buttonstyle ={position: 'relative', left : '5%', bottom: '30%',height: '5%', width: '10%', background : '#990000', color: 'white', border: '1px solid black', cursor: 'pointer'}
        return (
            <form className="jobForm" onSubmit={this.handleSubmit}>
                <input type="submit" value="DELETE" style= {buttonstyle} />
            </form>
        );
    }
});



var JobAboutForm = React.createClass({
  handleSubmit: function(e) {
      window.alert ("ES Project2\n\nBatch Processing on the Cloud\n\nmgreis@student.dei.uc.pt\nauxiliar@student.dei.uc.pt")
  },
    render: function() {
        var buttonstyle ={position: 'fixed', left : '5%', top: '30%',height: '5%', width: '10%', background : '#4CAF50', color: 'white', border: '1px solid black', cursor: 'pointer'}


        return (
            <form className="jobForm" onSubmit={this.handleSubmit}>
                <input type="submit" value="ABOUT" style = {buttonstyle}/>
            </form>
        );
    }
});


ReactDOM.render(
    <JobBox url="/manage_jobs_react"
            pollInterval = {10000}
    />,

    document.getElementById('content')
);
