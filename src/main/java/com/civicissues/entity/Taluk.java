package com.civicissues.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "taluks")
@Data
public class Taluk {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private District district;
}