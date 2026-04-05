CREATE DATABASE IF NOT EXISTS hms_db;
USE hms_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('patient', 'doctor', 'staff', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  date_of_birth DATE DEFAULT NULL,
  gender ENUM('male', 'female', 'other') DEFAULT NULL,
  blood_group VARCHAR(10) DEFAULT NULL,
  contact_number VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  specialization VARCHAR(255) DEFAULT 'General',
  department VARCHAR(255) DEFAULT 'General',
  contact_number VARCHAR(20) DEFAULT NULL,
  availability TEXT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  date_time DATETIME NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_date_time (date_time)
);

CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_id INT NOT NULL,
  diagnosis TEXT NOT NULL,
  prescription TEXT,
  notes TEXT,
  record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX idx_medical_patient (patient_id),
  INDEX idx_medical_doctor (doctor_id),
  INDEX idx_medical_appointment (appointment_id)
);

CREATE TABLE IF NOT EXISTS billings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  appointment_id INT NOT NULL,
  items JSON,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
  generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX idx_billing_patient (patient_id),
  INDEX idx_billing_appointment (appointment_id)
);

set sql_safe_updates = 0;

-- Allow patient profiles to be created with just user_id
ALTER TABLE patient_profiles MODIFY date_of_birth DATE DEFAULT NULL;
ALTER TABLE patient_profiles MODIFY gender ENUM('male', 'female', 'other') DEFAULT NULL;
ALTER TABLE patient_profiles MODIFY contact_number VARCHAR(20) DEFAULT NULL;

-- Allow doctor profiles to be created with just user_id + defaults
ALTER TABLE doctor_profiles MODIFY specialization VARCHAR(255) DEFAULT 'General';
ALTER TABLE doctor_profiles MODIFY department VARCHAR(255) DEFAULT 'General';
ALTER TABLE doctor_profiles MODIFY contact_number VARCHAR(20) DEFAULT NULL;

-- Backfill: create profiles for any existing users who don't have one
INSERT IGNORE INTO patient_profiles (user_id)
  SELECT id FROM users WHERE role = 'patient'
    AND id NOT IN (SELECT user_id FROM patient_profiles);

INSERT IGNORE INTO doctor_profiles (user_id, specialization, department)
  SELECT id, 'General', 'General' FROM users WHERE role = 'doctor'
    AND id NOT IN (SELECT user_id FROM doctor_profiles);
