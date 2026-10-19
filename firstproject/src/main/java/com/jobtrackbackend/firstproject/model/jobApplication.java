package com.jobtrackbackend.firstproject.model;

import java.time.LocalDate;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "job_applications")//custom table name
public class jobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)//automatically generated incremented value
    private long id;
   

    @NotBlank(message = "Company name is required")
    private String company;

    private long jobId;

    @NotBlank (message = "Position is required")
    private String position;

  @NotBlank(message = "Status is required")
  @Pattern(
    regexp = "^(APPLIED|SHORTLISTED|INTERVIEW|REJECTED|OFFER)$",
    message = "Invalid application status")
    private String status;

    @NotNull (message = "Applied date is required")
    @PastOrPresent (message = "Applied date cannot be in the future")
    private LocalDate appliedDate;

    private String jobUrl;

    private String notes;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

        public long getJobId() {
        return jobId;
    }

    public void setJobId(long jobId) {
        this.jobId = jobId;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
