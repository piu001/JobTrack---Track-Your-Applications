package com.jobtrackbackend.firstproject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobtrackbackend.firstproject.model.jobApplication;

@Repository
public interface jobTrackRepo extends JpaRepository<jobApplication, Long> {

    
}
