package com.jobtrackbackend.firstproject.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobtrackbackend.firstproject.model.jobApplication;
import com.jobtrackbackend.firstproject.service.jobTrackService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin
@RequestMapping("/api/applications")
public class jobTrackController {

    private final jobTrackService jtservice;

    public jobTrackController(jobTrackService jtservice) {//service injection instead of autowiring
        this.jtservice = jtservice;
    }

    @PostMapping
    public jobApplication addApplication(@Valid @RequestBody jobApplication application) {

        return jtservice.saveApplication(application);//so the request of saving a new applucation first comes to the controller, 
        // then the controller calls the service, and the service calls the repository to save it in the database.
    }

    @GetMapping
    public List<jobApplication> getAllApplications() {//the datatype should be same as the model name, which is jobApplication,
    //  and the return type should be List<jobApplication> because we are returning a list of applications.
        return jtservice.getAllApplications();
    }

    @DeleteMapping("/{id}")
    public void deleteApplication(@PathVariable Long id) {
        jtservice.deleteApplication(id);
    }

    @PutMapping("/{id}")
    public jobApplication updateApplication(@PathVariable Long id,@Valid  @RequestBody jobApplication application){
        return jtservice.updateApplication(id, application);
    }
}
