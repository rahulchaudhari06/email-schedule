from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import schedule
import time
import threading

app = Flask(__name__)
CORS(app)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "max5943q@gmail.com"
EMAIL_PASSWORD = "//Password here"


scheduled_emails = []
email_id_counter = 1

from threading import Lock

emails_lock = Lock()


def send_email(to_email, subject, body, email_id):
    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())
        server.quit()
        print(f"Email sent to {to_email}")

        with emails_lock:
            for email in scheduled_emails:
                if email["id"] == email_id:
                    email["status"] = "sent"
                    break
    except Exception as e:
        print(f"Failed to send email: {e}")


def schedule_email(to_email, subject, body, schedule_time, email_id):
    schedule.every().day.at(schedule_time).do(
        send_email, to_email, subject, body, email_id
    )
    print(f"Email scheduled for {schedule_time}")


def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)


scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.daemon = True
scheduler_thread.start()


@app.route("/schedule-email", methods=["POST"])
def schedule_email_route():
    global email_id_counter
    data = request.json
    to_email = data.get("to_email")
    subject = data.get("subject")
    body = data.get("body")
    schedule_time = data.get("schedule_time")

    if not all([to_email, subject, body, schedule_time]):
        return jsonify({"error": "Missing required fields"}), 400

    with emails_lock:
        email_id = email_id_counter
        email_id_counter += 1
        email_data = {
            "id": email_id,
            "to_email": to_email,
            "subject": subject,
            "body": body,
            "schedule_time": schedule_time,
            "status": "scheduled",
        }
        scheduled_emails.append(email_data)

    schedule_email(to_email, subject, body, schedule_time, email_id)
    return jsonify(
        {"message": "Email scheduled successfully", "email_id": email_id}
    ), 200


@app.route("/get-scheduled-emails", methods=["GET"])
def get_scheduled_emails():
    with emails_lock:
        return jsonify(scheduled_emails), 200


@app.route("/cancel-email/<int:email_id>", methods=["POST"])
def cancel_email(email_id):
    with emails_lock:
        for email in scheduled_emails:
            if email["id"] == email_id:
                email["status"] = "cancelled"
                return jsonify({"message": "Email cancelled successfully"}), 200
    return jsonify({"error": "Email not found"}), 404


@app.route("/remove-email/<int:email_id>", methods=["POST"])
def remove_email(email_id):
    global scheduled_emails
    with emails_lock:
        scheduled_emails = [
            email for email in scheduled_emails if email["id"] != email_id
        ]
    return jsonify({"message": "Email removed successfully"}), 200


if __name__ == "__main__":
    app.run(debug=True)

