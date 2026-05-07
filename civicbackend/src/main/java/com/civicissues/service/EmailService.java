package com.civicissues.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Send OTP email
    @Async
    public void sendOtpEmail(String toEmail, String name,
                             String otp, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);

            String subject = purpose.equals("REGISTRATION")
                    ? "Verify Your Email - Civic Issues Portal"
                    : "Login OTP - Civic Issues Portal";

            helper.setSubject(subject);
            helper.setText(buildOtpEmailHtml(name, otp, purpose), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send OTP email: "
                    + e.getMessage());
        }
    }

    // Send account approval email
    @Async
    public void sendApprovalEmail(String toEmail, String name,
                                  String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Account Approved - Civic Issues Portal"
            );
            helper.setText(
                    buildApprovalEmailHtml(name, role), true
            );

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send approval email: "
                    + e.getMessage());
        }
    }

    // Send account rejection email
    @Async
    public void sendRejectionEmail(String toEmail, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Account Registration Update - Civic Issues Portal"
            );
            helper.setText(
                    buildRejectionEmailHtml(name), true
            );

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send rejection email: "
                    + e.getMessage());
        }
    }

    // Send issue assigned email to citizen
    @Async
    public void sendIssueAssignedEmail(String toEmail,
                                       String citizenName, String issueCode,
                                       String issueTitle, String authorityName,
                                       String department, String expectedDate) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Issue Assigned - " + issueCode
                            + " | Civic Issues Portal"
            );
            helper.setText(
                    buildIssueAssignedEmailHtml(
                            citizenName, issueCode, issueTitle,
                            authorityName, department, expectedDate
                    ), true
            );

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println(
                    "Failed to send issue assigned email: "
                            + e.getMessage()
            );
        }
    }

    // Send issue status update email
    @Async
    public void sendStatusUpdateEmail(String toEmail,
                                      String citizenName, String issueCode,
                                      String issueTitle, String newStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Issue Update - " + issueCode
                            + " | Civic Issues Portal"
            );
            helper.setText(
                    buildStatusUpdateEmailHtml(
                            citizenName, issueCode,
                            issueTitle, newStatus
                    ), true
            );

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println(
                    "Failed to send status update email: "
                            + e.getMessage()
            );
        }
    }

    // Send issue completed email
    @Async
    public void sendIssueCompletedEmail(String toEmail,
                                        String citizenName, String issueCode,
                                        String issueTitle) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(
                    "Issue Resolved! - " + issueCode
                            + " | Civic Issues Portal"
            );
            helper.setText(
                    buildCompletedEmailHtml(
                            citizenName, issueCode, issueTitle
                    ), true
            );

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println(
                    "Failed to send completed email: "
                            + e.getMessage()
            );
        }
    }

    // ─────────────────────────────────────────
    // HTML Email Templates
    // ─────────────────────────────────────────

    private String buildOtpEmailHtml(
            String name, String otp,
            String purpose) {
        String purposeText =
                purpose.equals("REGISTRATION")
                        ? "complete your registration"
                        : "login to your account";
        String heading =
                purpose.equals("REGISTRATION")
                        ? "Welcome to CivicFix! 🎉"
                        : "Login Verification 🔐";

        return "<!DOCTYPE html><html><body "
                + "style='font-family:Arial;"
                + "background:#f4f4f4;padding:20px'>"
                + "<div style='max-width:600px;"
                + "margin:auto;background:white;"
                + "border-radius:10px;padding:30px;"
                + "box-shadow:0 2px 10px "
                + "rgba(0,0,0,0.1)'>"
                + "<div style='text-align:center;"
                + "margin-bottom:25px'>"
                + "<h2 style='color:#2c7be5;margin:0'>"
                + "🏙️ CivicFix</h2>"
                + "<p style='color:#6c757d;margin:5px 0'>"
                + "Smart City Issue Reporting</p></div>"
                + "<h3 style='color:#333'>"
                + heading + "</h3>"
                + "<p style='color:#555'>Hello "
                + "<strong>" + name + "</strong>!</p>"
                + "<p style='color:#555'>Your OTP to "
                + purposeText + " is:</p>"
                + "<div style='text-align:center;"
                + "margin:25px 0'>"
                + "<div style='display:inline-block;"
                + "font-size:42px;font-weight:bold;"
                + "color:#2c7be5;padding:20px 40px;"
                + "background:#f0f7ff;"
                + "border-radius:12px;"
                + "border:2px solid #bee3f8;"
                + "letter-spacing:12px'>"
                + otp + "</div></div>"
                + "<div style='background:#fff8e1;"
                + "border:1px solid #ffc107;"
                + "border-radius:8px;padding:12px;"
                + "margin:15px 0'>"
                + "<p style='margin:0;color:#856404;"
                + "font-size:14px'>⏱️ This OTP is valid "
                + "for <strong>5 minutes</strong> only. "
                + "Do not share it with anyone.</p></div>"
                + "<p style='color:#999;font-size:12px'>"
                + "If you did not request this, "
                + "please ignore this email.</p>"
                + "<hr style='border:none;"
                + "border-top:1px solid #eee;margin:20px 0'>"
                + "<p style='color:#999;font-size:12px;"
                + "text-align:center'>"
                + "© CivicFix - Reporting for a "
                + "Better Tomorrow</p>"
                + "</div></body></html>";
    }

    private String buildApprovalEmailHtml(
            String name, String role) {
        return "<!DOCTYPE html><html><body style='font-family:Arial;"
                + "background:#f4f4f4;padding:20px'>"
                + "<div style='max-width:600px;margin:auto;"
                + "background:white;border-radius:10px;"
                + "padding:30px;box-shadow:0 2px 10px "
                + "rgba(0,0,0,0.1)'>"
                + "<div style='text-align:center;"
                + "margin-bottom:20px'>"
                + "<h2 style='color:#2c7be5;margin:0'>"
                + "🏙️ CivicFix</h2>"
                + "<p style='color:#6c757d;margin:5px 0'>"
                + "Smart City Issue Reporting Platform"
                + "</p></div>"
                + "<h3 style='color:#333'>Hello "
                + name + "! 👋</h3>"
                + "<p style='color:#555;line-height:1.6'>"
                + "🎉 Congratulations! Your account has "
                + "been <strong style='color:#198754'>"
                + "approved</strong> as a "
                + "<strong>" + role + "</strong> "
                + "on CivicFix!</p>"
                + "<div style='background:#f0fff4;"
                + "border:1px solid #198754;"
                + "border-radius:8px;padding:15px;"
                + "margin:20px 0'>"
                + "<p style='margin:0;color:#0f5132'>"
                + "✅ You can now login and access "
                + "your dashboard to report and track "
                + "civic issues in your area.</p></div>"
                + "<div style='text-align:center;"
                + "margin:25px 0'>"
                + "<a href='http://localhost:3000/login' "
                + "style='display:inline-block;"
                + "padding:14px 35px;"
                + "background:linear-gradient("
                + "135deg,#2c7be5,#1a68d1);"
                + "color:white;text-decoration:none;"
                + "border-radius:8px;font-weight:bold;"
                + "font-size:16px'>Login to Dashboard"
                + "</a></div>"
                + "<hr style='border:none;"
                + "border-top:1px solid #eee'>"
                + "<p style='color:#999;font-size:12px;"
                + "text-align:center'>"
                + "CivicFix - Reporting for a "
                + "Better Tomorrow</p>"
                + "</div></body></html>";
    }

    private String buildRejectionEmailHtml(String name) {
        return "<!DOCTYPE html><html><body style='font-family:Arial;" +
                "background:#f4f4f4;padding:20px'>" +
                "<div style='max-width:600px;margin:auto;background:white;" +
                "border-radius:10px;padding:30px'>" +
                "<h2 style='color:#2c7be5'>Civic Issues Portal</h2>" +
                "<h3>Hello " + name + "!</h3>" +
                "<p>We regret to inform you that your account registration" +
                " has been <strong style='color:red'>rejected</strong>.</p>" +
                "<p>Please contact support for more information.</p>" +
                "<p style='color:#999;font-size:12px;margin-top:20px'>" +
                "Civic Issues Portal</p>" +
                "</div></body></html>";
    }

    private String buildIssueAssignedEmailHtml(
            String citizenName, String issueCode,
            String issueTitle, String authorityName,
            String department, String expectedDate) {
        return "<!DOCTYPE html><html><body style='font-family:Arial;" +
                "background:#f4f4f4;padding:20px'>" +
                "<div style='max-width:600px;margin:auto;background:white;" +
                "border-radius:10px;padding:30px'>" +
                "<h2 style='color:#2c7be5'>Civic Issues Portal</h2>" +
                "<h3>Hello " + citizenName + "!</h3>" +
                "<p>Your issue has been <strong style='color:#2c7be5'>" +
                "assigned</strong> to an authority.</p>" +
                "<table style='width:100%;border-collapse:collapse;" +
                "margin-top:15px'>" +
                "<tr style='background:#f0f7ff'>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                "<strong>Issue ID</strong></td>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                issueCode + "</td></tr>" +
                "<tr><td style='padding:10px;border:1px solid #ddd'>" +
                "<strong>Title</strong></td>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                issueTitle + "</td></tr>" +
                "<tr style='background:#f0f7ff'>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                "<strong>Assigned To</strong></td>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                authorityName + "</td></tr>" +
                "<tr><td style='padding:10px;border:1px solid #ddd'>" +
                "<strong>Department</strong></td>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                department + "</td></tr>" +
                "<tr style='background:#f0f7ff'>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                "<strong>Expected Date</strong></td>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                expectedDate + "</td></tr>" +
                "</table>" +
                "<p style='color:#999;font-size:12px;margin-top:20px'>" +
                "Civic Issues Portal</p>" +
                "</div></body></html>";
    }

    private String buildStatusUpdateEmailHtml(
            String citizenName, String issueCode,
            String issueTitle, String newStatus) {
        return "<!DOCTYPE html><html><body style='font-family:Arial;" +
                "background:#f4f4f4;padding:20px'>" +
                "<div style='max-width:600px;margin:auto;background:white;" +
                "border-radius:10px;padding:30px'>" +
                "<h2 style='color:#2c7be5'>Civic Issues Portal</h2>" +
                "<h3>Hello " + citizenName + "!</h3>" +
                "<p>Your issue <strong>" + issueCode +
                "</strong> status has been updated to: " +
                "<strong style='color:#2c7be5'>" +
                newStatus + "</strong></p>" +
                "<p>Issue: " + issueTitle + "</p>" +
                "<p style='color:#999;font-size:12px;margin-top:20px'>" +
                "Civic Issues Portal</p>" +
                "</div></body></html>";
    }

    private String buildCompletedEmailHtml(
            String citizenName, String issueCode,
            String issueTitle) {
        return "<!DOCTYPE html><html><body style='font-family:Arial;" +
                "background:#f4f4f4;padding:20px'>" +
                "<div style='max-width:600px;margin:auto;background:white;" +
                "border-radius:10px;padding:30px'>" +
                "<h2 style='color:#2c7be5'>Civic Issues Portal</h2>" +
                "<h3>Hello " + citizenName + "!</h3>" +
                "<p>🎉 Great news! Your issue has been " +
                "<strong style='color:green'>resolved</strong>!</p>" +
                "<table style='width:100%;border-collapse:collapse;" +
                "margin-top:15px'>" +
                "<tr style='background:#f0f7ff'>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                "<strong>Issue ID</strong></td>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                issueCode + "</td></tr>" +
                "<tr><td style='padding:10px;border:1px solid #ddd'>" +
                "<strong>Title</strong></td>" +
                "<td style='padding:10px;border:1px solid #ddd'>" +
                issueTitle + "</td></tr>" +
                "</table>" +
                "<p style='margin-top:15px'>Please take a moment to " +
                "<strong>rate the work</strong> done by the authority " +
                "in your dashboard.</p>" +
                "<a href='http://localhost:3000/citizen/dashboard' " +
                "style='display:inline-block;padding:12px 24px;" +
                "background:#2c7be5;color:white;text-decoration:none;" +
                "border-radius:6px;margin-top:10px'>Rate Now</a>" +
                "<p style='color:#999;font-size:12px;margin-top:20px'>" +
                "Civic Issues Portal</p>" +
                "</div></body></html>";
    }
}
