package com.dyslexia.backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "games")
public class Games {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String color;
    private String imageUrl;
    private Integer orderIndex;
    private Integer totalLevels = 7;

    public Games() {

    }
    
    public Long getId() {
        return id;
    }
 
    public void setId(Long id) {
        this.id = id;
    }
 
    public String getName() {
        return name;
    }
 
    public void setName(String name) {
        this.name = name;
    }
 
    public String getColor() {
        return color;
    }
 
    public void setColor(String color) {
        this.color = color;
    }
 
    public String getImageUrl() {
        return imageUrl;
    }
 
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
 
    public Integer getOrderIndex() {
        return orderIndex;
    }
 
    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
 
    public Integer getTotalLevels() {
        return totalLevels;
    }
 
    public void setTotalLevels(Integer totalLevels) {
        this.totalLevels = totalLevels;
    }
}
