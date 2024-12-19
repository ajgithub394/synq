"use client"
import Image from 'next/image'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from './ui/textarea'
import ReactDatePicker from 'react-datepicker'
import { Input } from './ui/input'

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>();
  const [values,setValues] = useState({
    dateTime : new Date(),
    descrption : '',
    link : ''
  })

  const [callDetails,setCallDetails] = useState<Call>();
  const {toast} = useToast();

  const {user} = useUser();
  const client = useStreamVideoClient();

  const createMeeting = async ()=>{
    if(!client || !user){
      return;
    }

    try {
      if(!values.dateTime){
        toast({title:"Please select a date and a time"});
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default',id);

      if(!call) throw new Error('Call Failed');

      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.descrption || 'Instant Meeting';

      await call.getOrCreate({
        data : {
          starts_at : startsAt,
          custom :{
            description,
          }
        }
      })

      setCallDetails(call);

      if(!values.descrption){
        router.push(`/meeting/${call.id}`);
      }

      toast({title: 'Created a Meeting'});
    } catch (error) {
      console.log(error);
      toast({
        title : "Meeting could not be created",
      })
    }

  }

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`
  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>

      <HomeCard
        img = '/icons/join-meeting.svg'
        title = 'Join Meeting'
        description = 'via invitation link'
        handleClick = {()=>setMeetingState('isJoiningMeeting')}
        className = 'bg-purple-1'
      />

      <HomeCard
        img = '/icons/add-meeting.svg'
        title = 'New Meeting'
        description = 'Start an instant meeting'
        handleClick = {()=>setMeetingState('isInstantMeeting')}
        className = 'bg-yellow-1'
      />

      <HomeCard
        img = '/icons/schedule.svg'
        title = 'Schedule Meeting'
        description = 'Plan your next meeting'
        handleClick = {()=>setMeetingState('isScheduleMeeting')}
        className = 'bg-orange-1'
      />
      
      <HomeCard
        img = '/icons/recordings.svg'
        title = 'Recordings'
        description = 'Find recordings of meetings'
        handleClick = {()=>router.push('/recordings')}
        className = 'bg-blue-1'
      />

      {!callDetails?
        (<MeetingModal
          isOpen = {meetingState === 'isScheduleMeeting'}
          onClose = {()=>setMeetingState(undefined)}
          title = 'Create a meeting'
          handleClick = {createMeeting}
        >
          <div className='flex flex-col gap-2.5'>
            <label className='text-base text-normal leading-[22px] text-sky-200'>Agenda of the meeting</label>
            <Textarea className='border-none bg-dark-4 focus-visible:ring-0 focus-visible:ring-offset-0'
              onChange={(e)=>{
                setValues({...values,descrption:e.target.value})
              }}
            />
          </div>
          <div className='flex w-full flex-col gap-2.5'>
            <label className='text-base text-normal leading-[22px] text-sky-200'>Pick a date and time</label>
            <ReactDatePicker selected={values.dateTime} onChange={(date)=>setValues({...values,dateTime : date!})} showTimeSelect timeFormat='HH:mm' timeIntervals={15} timeCaption='Time' dateFormat="d MMMM, yyyy h:mm aa" className='w-full rounded bg-dark-4 p-2 focus:outline-none'/>
          </div>
        </MeetingModal>):(
          <MeetingModal
            isOpen = {meetingState === 'isScheduleMeeting'}
            onClose = {()=>setMeetingState(undefined)}
            title = 'Meeting Created'
            className = "text-center"
            handleClick = {()=>{
              navigator.clipboard.writeText(meetingLink);
              toast({title : "Copied the link"});
            }}
            image='/icons/checked.svg'
            buttonIcon='/icons/copy.svg'
            buttonText = "Copy meeting link"
          />
        )
      }
      <MeetingModal
        isOpen = {meetingState === 'isInstantMeeting'}
        onClose = {()=>setMeetingState(undefined)}
        title = 'Start a new Meeting'
        className = "text-center"
        buttonText = "Start Meeting"
        handleClick = {createMeeting}
      />

      <MeetingModal
        isOpen = {meetingState === 'isJoiningMeeting'}
        onClose = {()=>setMeetingState(undefined)}
        title = 'Enter the meeting link'
        className = "text-center"
        buttonText = "Join Meeting"
        handleClick = {() => router.push(values.link)}
      >
        <Input placeholder='Meeting Link' className='border-none bg-dark-4 focus-visible:ring-0 focus-visible:ring-offset-0' onChange={(e)=>setValues({...values,link : e.target.value})}/>
      </MeetingModal>


    </section>
  )
}

export default MeetingTypeList