'''
Exemplo recolhido na Internet e adaptado
'''
import boto3
from botocore.client import Config

botoConfig = Config(connect_timeout=50, read_timeout=70)
swf = boto3.client('swf', config=botoConfig)

DOMAIN = "MyFinalSWF"
WORKFLOW = "MyFinalSWF2"
TASKNAME = "proof_of_work"
VERSION = "1"
TASKLIST = "MyFinalTaskList2"


activityid = 1

while True:
    print("Listening for Decision Tasks")
    newTask = swf.poll_for_decision_task(domain=DOMAIN, taskList={'name': TASKLIST}, identity='decider-1', reverseOrder=False)

    if 'taskToken' not in newTask:
        print("Poll timed out, no new task.  Repoll")
    elif 'events' in newTask:
        eventHistory = [evt for evt in newTask['events'] if not evt['eventType'].startswith('Decision')]
        lastEvent = eventHistory[-1]
        
        if lastEvent['eventType'] == 'WorkflowExecutionStarted':
            print('lastEvent = ', lastEvent)
            print("Dispatching task to worker", newTask['workflowExecution'], newTask['workflowType'], newTask['taskToken'])
            a = swf.respond_decision_task_completed(taskToken=newTask['taskToken'],
                                              decisions=[
                                                         {
                                                          'decisionType': 'ScheduleActivityTask',
                                                          'scheduleActivityTaskDecisionAttributes': {
                                                                                                     'activityType':{
                                                                                                                     'name': TASKNAME,
                                                                                                                     'version': VERSION
                                                                                                                     },
                                                                                                     'activityId': 'activityid-' + str(activityid),
                                                                                                     'input': lastEvent['workflowExecutionStartedEventAttributes']['input'],
                                                                                                     'scheduleToCloseTimeout': 'NONE',
                                                                                                     'scheduleToStartTimeout': 'NONE',
                                                                                                     'startToCloseTimeout': 'NONE',
                                                                                                     'heartbeatTimeout': 'NONE',
                                                                                                     'taskList': {'name': TASKLIST},
                                                                                                     }
                                                          }
                                                         ]
                                              )
            print(a)
            activityid += 1
            print("Task Dispatched:", newTask['taskToken'])
        elif lastEvent['eventType'] == 'ActivityTaskCompleted':
            theresult = lastEvent['activityTaskCompletedEventAttributes']['result']
            print('Finished task. Result = ', theresult)
            swf.respond_decision_task_completed(
                                            taskToken=newTask['taskToken'],
                                            decisions=[
                                                       {
                                                        'decisionType': 'CompleteWorkflowExecution',
                                                        'completeWorkflowExecutionDecisionAttributes': {
                                                          'result': str(theresult)
                                                        }
                                                      }
                                                    ]
                                                  )
