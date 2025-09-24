/**
 * Prep Panel Component
 * Auto-opens for calendar/meeting intents, helps prepare for upcoming meetings
 */

import React, { useState, useEffect } from 'react';
import { connectorGraphService, GraphEvent } from '../../services/ConnectorGraphService';

interface PrepPanelProps {
  onClose: () => void;
  currentUser?: {
    id: string;
    displayName: string;
    email: string;
  };
}

interface MeetingPrep {
  event: GraphEvent;
  relatedFiles: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  agenda: string[];
  notes: string;
  actionItems: string[];
}

export function PrepPanel({ onClose, currentUser }: PrepPanelProps) {
  const [upcomingMeetings, setUpcomingMeetings] = useState<GraphEvent[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<GraphEvent | null>(null);
  const [meetingPrep, setMeetingPrep] = useState<MeetingPrep | null>(null);
  const [loading, setLoading] = useState(false);
  const [preparingMeeting, setPreparingMeeting] = useState(false);

  // Load upcoming meetings on mount
  useEffect(() => {
    loadUpcomingMeetings();
  }, []);

  // Auto-select next meeting
  useEffect(() => {
    if (upcomingMeetings.length > 0 && !selectedMeeting) {
      const nextMeeting = getNextMeeting();
      if (nextMeeting) {
        setSelectedMeeting(nextMeeting);
        prepareForMeeting(nextMeeting);
      }
    }
  }, [upcomingMeetings]);

  // Load upcoming meetings for the next 7 days
  const loadUpcomingMeetings = async () => {
    setLoading(true);
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await connectorGraphService.getCalendarEvents(startDate, endDate);
      
      if (response.success && response.data) {
        // Filter and sort meetings
        const meetings = response.data
          .filter(event => new Date(event.start.dateTime) > new Date()) // Only future meetings
          .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime());
        
        setUpcomingMeetings(meetings);
      }
    } catch (error) {
      console.error('Failed to load upcoming meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the next meeting (within next 24 hours)
  const getNextMeeting = (): GraphEvent | null => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return upcomingMeetings.find(meeting => {
      const meetingTime = new Date(meeting.start.dateTime);
      return meetingTime >= now && meetingTime <= tomorrow;
    }) || upcomingMeetings[0] || null;
  };

  // Prepare for a specific meeting
  const prepareForMeeting = async (meeting: GraphEvent) => {
    setPreparingMeeting(true);
    try {
      // Generate agenda based on meeting title and description
      const agenda = generateAgenda(meeting);
      
      // Search for related files
      const relatedFiles = await findRelatedFiles(meeting);
      
      // Generate preparation notes
      const notes = generatePrepNotes(meeting);
      
      // Extract potential action items
      const actionItems = extractActionItems(meeting);

      const prep: MeetingPrep = {
        event: meeting,
        relatedFiles,
        agenda,
        notes,
        actionItems
      };

      setMeetingPrep(prep);
    } catch (error) {
      console.error('Failed to prepare for meeting:', error);
    } finally {
      setPreparingMeeting(false);
    }
  };

  // Generate agenda based on meeting content
  const generateAgenda = (meeting: GraphEvent): string[] => {
    const agenda: string[] = [];
    
    // Standard agenda items
    agenda.push('Welcome & Introductions');
    
    // Parse meeting title for specific items
    const title = meeting.subject.toLowerCase();
    if (title.includes('review') || title.includes('status')) {
      agenda.push('Status Review');
      agenda.push('Key Updates');
    }
    
    if (title.includes('planning') || title.includes('strategy')) {
      agenda.push('Strategic Discussion');
      agenda.push('Next Steps Planning');
    }
    
    if (title.includes('standup') || title.includes('daily')) {
      agenda.push('Yesterday\'s Accomplishments');
      agenda.push('Today\'s Priorities');
      agenda.push('Blockers & Issues');
    }
    
    // Parse meeting body for additional items
    if (meeting.body?.content) {
      const content = meeting.body.content.toLowerCase();
      if (content.includes('budget') || content.includes('financial')) {
        agenda.push('Budget Discussion');
      }
      if (content.includes('timeline') || content.includes('deadline')) {
        agenda.push('Timeline Review');
      }
    }
    
    agenda.push('Action Items & Next Steps');
    agenda.push('Wrap-up');
    
    return agenda;
  };

  // Find related files for the meeting
  const findRelatedFiles = async (meeting: GraphEvent): Promise<Array<{title: string; url: string; type: string}>> => {
    try {
      // Extract keywords from meeting title
      const keywords = meeting.subject
        .replace(/[^\w\s]/g, ' ')
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(' ');

      if (!keywords) return [];

      const response = await connectorGraphService.searchFiles(keywords);
      
      if (response.success && response.data) {
        return response.data.slice(0, 5).map(file => ({
          title: file.name,
          url: file.webUrl,
          type: getFileType(file.name)
        }));
      }
    } catch (error) {
      console.error('Failed to find related files:', error);
    }
    
    return [];
  };

  // Generate preparation notes
  const generatePrepNotes = (meeting: GraphEvent): string => {
    const notes: string[] = [];
    
    notes.push(`Meeting: ${meeting.subject}`);
    notes.push(`Time: ${formatMeetingTime(meeting)}`);
    notes.push(`Duration: ${calculateDuration(meeting)}`);
    
    if (meeting.location?.displayName) {
      notes.push(`Location: ${meeting.location.displayName}`);
    }
    
    if (meeting.attendees && meeting.attendees.length > 0) {
      notes.push(`Attendees: ${meeting.attendees.length} people`);
      const organizer = meeting.attendees.find(a => a.type === 'organizer');
      if (organizer) {
        notes.push(`Organizer: ${organizer.emailAddress.name}`);
      }
    }
    
    if (meeting.body?.content) {
      notes.push('');
      notes.push('Meeting Description:');
      const cleanContent = meeting.body.content.replace(/<[^>]*>/g, '').trim();
      notes.push(cleanContent.substring(0, 300) + (cleanContent.length > 300 ? '...' : ''));
    }
    
    return notes.join('\n');
  };

  // Extract potential action items
  const extractActionItems = (meeting: GraphEvent): string[] => {
    const items: string[] = [];
    
    // Standard prep items based on meeting type
    const title = meeting.subject.toLowerCase();
    
    if (title.includes('review') || title.includes('status')) {
      items.push('Prepare status update');
      items.push('Review previous action items');
    }
    
    if (title.includes('planning')) {
      items.push('Review project timelines');
      items.push('Prepare resource requirements');
    }
    
    if (title.includes('1:1') || title.includes('one-on-one')) {
      items.push('Prepare personal updates');
      items.push('Review goals and objectives');
    }
    
    // Always include these
    items.push('Review related documents');
    items.push('Prepare questions and discussion points');
    
    return items;
  };

  // Helper functions
  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['doc', 'docx'] .includes(ext || '')) return 'Document';
    if (['ppt', 'pptx'].includes(ext || '')) return 'Presentation';
    if (['xls', 'xlsx'].includes(ext || '')) return 'Spreadsheet';
    if (ext === 'pdf') return 'PDF';
    return 'File';
  };

  const formatMeetingTime = (meeting: GraphEvent): string => {
    const start = new Date(meeting.start.dateTime);
    const end = new Date(meeting.end.dateTime);
    
    const isToday = start.toDateString() === new Date().toDateString();
    const isTomorrow = start.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
    
    let dateStr = start.toLocaleDateString();
    if (isToday) dateStr = 'Today';
    else if (isTomorrow) dateStr = 'Tomorrow';
    
    const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    return `${dateStr} ${timeStr}`;
  };

  const calculateDuration = (meeting: GraphEvent): string => {
    const start = new Date(meeting.start.dateTime);
    const end = new Date(meeting.end.dateTime);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  const getTimeUntilMeeting = (meeting: GraphEvent): string => {
    const now = new Date();
    const meetingTime = new Date(meeting.start.dateTime);
    const diffMs = meetingTime.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Past';
    if (diffMs < 60 * 60 * 1000) return `In ${Math.round(diffMs / (1000 * 60))} minutes`;
    if (diffMs < 24 * 60 * 60 * 1000) return `In ${Math.round(diffMs / (1000 * 60 * 60))} hours`;
    return `In ${Math.round(diffMs / (1000 * 60 * 60 * 24))} days`;
  };

  return (
    <div className="prep-panel">
      <div className="panel-header">
        <h3 className="panel-title">📅 Meeting Preparation</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading upcoming meetings...</p>
        </div>
      )}

      {!loading && upcomingMeetings.length === 0 && (
        <div className="empty-state">
          <p>🎉 No upcoming meetings found</p>
          <p className="empty-hint">Looks like you have a clear schedule!</p>
        </div>
      )}

      {!loading && upcomingMeetings.length > 0 && (
        <>
          {/* Next Meeting Highlight */}
          {selectedMeeting && (
            <div className="next-meeting-card">
              <div className="meeting-header">
                <h4 className="meeting-title">{selectedMeeting.subject}</h4>
                <span className="meeting-time-badge">
                  {getTimeUntilMeeting(selectedMeeting)}
                </span>
              </div>
              <p className="meeting-time">{formatMeetingTime(selectedMeeting)}</p>
              {selectedMeeting.attendees && (
                <p className="meeting-attendees">
                  👥 {selectedMeeting.attendees.length} attendees
                </p>
              )}
            </div>
          )}

          {/* Meeting Preparation Content */}
          {preparingMeeting && (
            <div className="preparing-state">
              <div className="loading-spinner"></div>
              <p>Preparing meeting materials...</p>
            </div>
          )}

          {meetingPrep && (
            <div className="prep-content">
              {/* Agenda */}
              <div className="prep-section">
                <h4 className="section-title">📋 Suggested Agenda</h4>
                <div className="agenda-list">
                  {meetingPrep.agenda.map((item, index) => (
                    <div key={index} className="agenda-item">
                      <span className="agenda-number">{index + 1}.</span>
                      <span className="agenda-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Files */}
              {meetingPrep.relatedFiles.length > 0 && (
                <div className="prep-section">
                  <h4 className="section-title">📁 Related Files</h4>
                  <div className="files-list">
                    {meetingPrep.relatedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-icon">
                          {file.type === 'Document' && '📄'}
                          {file.type === 'Presentation' && '📊'}
                          {file.type === 'Spreadsheet' && '📈'}
                          {file.type === 'PDF' && '📕'}
                          {file.type === 'File' && '📁'}
                        </span>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-link">
                          {file.title}
                        </a>
                        <span className="file-type">{file.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              <div className="prep-section">
                <h4 className="section-title">✅ Pre-Meeting Action Items</h4>
                <div className="action-items">
                  {meetingPrep.actionItems.map((item, index) => (
                    <label key={index} className="action-item">
                      <input type="checkbox" />
                      <span className="action-text">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Meeting Notes */}
              <div className="prep-section">
                <h4 className="section-title">📝 Meeting Details</h4>
                <div className="meeting-notes">
                  <pre>{meetingPrep.notes}</pre>
                </div>
              </div>
            </div>
          )}

          {/* All Upcoming Meetings */}
          <div className="prep-section">
            <h4 className="section-title">📅 All Upcoming Meetings</h4>
            <div className="meetings-list">
              {upcomingMeetings.slice(0, 5).map((meeting, index) => (
                <div
                  key={meeting.id}
                  className={`meeting-item ${selectedMeeting?.id === meeting.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    prepareForMeeting(meeting);
                  }}
                >
                  <div className="meeting-info">
                    <h5 className="meeting-title">{meeting.subject}</h5>
                    <p className="meeting-time">{formatMeetingTime(meeting)}</p>
                  </div>
                  <div className="meeting-badge">
                    {getTimeUntilMeeting(meeting)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PrepPanel;