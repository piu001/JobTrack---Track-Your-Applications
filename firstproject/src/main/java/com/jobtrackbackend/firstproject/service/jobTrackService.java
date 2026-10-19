package com.jobtrackbackend.firstproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jobtrackbackend.firstproject.model.jobApplication;
import com.jobtrackbackend.firstproject.repository.jobTrackRepo;

@Service
public class jobTrackService {
    private final jobTrackRepo jtrepo;//repo access


    public jobTrackService(jobTrackRepo jtrepo ) {//constructor injection instead of autowiring
        this.jtrepo = jtrepo;
    }

    public jobApplication saveApplication(jobApplication application) {

    return jtrepo.save(application);
    }

    public List<jobApplication> getAllApplications() {
        return jtrepo.findAll();
    }

    public void deleteApplication(Long id) {
        jtrepo.deleteById(id);
    }

    public jobApplication updateApplication(Long id, jobApplication application) {
        jobApplication existingApplication = jtrepo.findById(id).orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        
        existingApplication.setCompany(
            application.getCompany());

            existingApplication.setPosition(application.getPosition());
existingApplication.setStatus(application.getStatus());
existingApplication.setAppliedDate(application.getAppliedDate());
existingApplication.setJobUrl(application.getJobUrl());
existingApplication.setNotes(application.getNotes());
        return jtrepo.save(existingApplication);
        
    }
}

