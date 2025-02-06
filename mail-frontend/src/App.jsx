// USE REACTBITS.DEV TO ADD BETTER TEXT ANIMS

import React, { useState, useEffect } from "react";


function App() {
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const fetchScheduledEmails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-scheduled-emails");
      const data = await response.json();
      setScheduledEmails(data);
    } catch (error) {
      console.error("Error fetching scheduled emails:", error);
    }
  };


  useEffect(() => {
    fetchScheduledEmails();


    const interval = setInterval(fetchScheduledEmails, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:5000/schedule-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to_email: toEmail,
        subject: subject,
        body: body,
        schedule_time: scheduleTime,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Email scheduled successfully!");
      fetchScheduledEmails();
    } else {
      alert("Error: " + data.error);
    }
  };

  const handleCancel = async (emailId) => {
    const response = await fetch(`http://127.0.0.1:5000/cancel-email/${emailId}`, {
      method: "POST",
    });

    const data = await response.json();
    if (response.ok) {
      alert("Email cancelled successfully!");
      fetchScheduledEmails(); 
    } else {
      alert("Error: " + data.error);
    }
  };

  const handleRemove = async (emailId) => {
    const response = await fetch(`http://127.0.0.1:5000/remove-email/${emailId}`, {
      method: "POST",
    });

    const data = await response.json();
    if (response.ok) {
      alert("Email removed successfully!");
      fetchScheduledEmails();
    } else {
      alert("Error: " + data.error);
    }
  };

  return (


        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 ">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mb-8 drop-shadow-lg border-2 border-gray-300">
            <h1 className="text-2xl font-bold mb-6 text-center">Schedule Email</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">To Email</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Schedule Time (HH:MM)</label>
                <input
                  type="text"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., 14:30"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Schedule Email
              </button>
            </form>
          </div>
    
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl border-2 border-gray-300">
            <h2 className="text-2xl font-bold mb-6 text-center">Scheduled Emails</h2>
            <div className="space-y-4">
              {scheduledEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 border rounded-lg ${
                    email.status === "sent" ? "bg-green-50" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">To: {email.to_email}</p>
                      <p>Subject: {email.subject}</p>
                      <p>Time: {email.schedule_time}</p>
                      <p className={` ${
                    email.status === "sent" ? "bg-green-50 text-green-500 text-lg" : "bg-white text-yellow-500 text-lg "
                  }`} >Status: {email.status}</p>
                    </div>
                    <div className="space-x-2">
                      {email.status === "scheduled" && (
                        <button
                          onClick={() => handleCancel(email.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(email.id)}
                        className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                        >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


  )

  
}

export default App;