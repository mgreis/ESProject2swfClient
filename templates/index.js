// tutorial21.js
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
    return (
      <div className="JobList">
          {jobNodes}
      </div>
    );
  }
});

var Job = React.createClass({


  render: function() {
       var onJobDelete   = this.props.onJobDelete;

    return (
      <div className="job">
          <br/>
            <p className="jobAuthor">
                id:           {this.props.job_id}<br/>
                State:        {this.props.job_state}<br/>
                Submitted on: {this.props.job_submitted}<br/>
                Started on:   {this.props.job_started}<br/>
                Finished on:  {this.props.job_finished}<br/>
                File name:    {this.props.job_file}<br/><br/>
            </p>
          <DeleteJobForm onJobDelete = {onJobDelete} job_id = {this.props.job_id} job_file = {this.props.job_file}/>
      </div>
    );
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
        return (
            <form className="jobForm" onSubmit={this.handleSubmit}>
                <input type="submit" value="Post" />
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
        return (
            <form className="jobForm" onSubmit={this.handleSubmit}>
                <input type="submit" value="DELETE" />
            </form>
        );
    }
});






ReactDOM.render(
    <JobBox url="/manage_jobs_react"
            pollInterval = {100000}
    />,

    document.getElementById('content')
);
