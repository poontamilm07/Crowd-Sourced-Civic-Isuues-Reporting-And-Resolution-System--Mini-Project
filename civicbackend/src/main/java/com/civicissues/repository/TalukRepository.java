package com.civicissues.repository;

import com.civicissues.entity.Taluk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TalukRepository
        extends JpaRepository<Taluk, Long> {

    List<Taluk> findByDistrictId(Long districtId);
}