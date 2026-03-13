// 🚩 ฟังก์ชันโหลดข้อมูลคนเก่ามาใส่ฟอร์ม
  const handleSelectExistingDriver = (driver: any) => {
    const nameParts = driver.name.split(' ');
    const fName = nameParts[0];
    const lName = nameParts.slice(1).join(' ');

    setFormData({
      ...formData,
      driverId: driver.rawId,
      firstName: fName,
      lastName: lName,
      birthDate: driver.rawBirthDate ? new Date(driver.rawBirthDate).toISOString().split('T')[0] : '',
      nickname: driver.nickname || '',
      nationality: driver.nationality || '',
      licenseNo: driver.licenseNo || '',
      licenseImageUrl: driver.licenseImageUrl || '', // 🚩 อยู่ตรงนี้ครับ (มีลูกน้ำต่อท้ายด้วย)
      shirtSize: driver.shirtSize || '',
      bloodType: driver.bloodType || '',
      mobileNo: driver.mobileNo || '',
      guardianName: driver.guardianName || '',
      guardianId: driver.guardianId || '',
      guardianNationality: driver.guardianNationality || '',
      guardianMobile: driver.guardianMobile || '',
      racingNumber: '', 
      primaryClass: '', 
      crossEntry: false
    });
    setIsEditingProfile(false); // ล็อกข้อมูลไว้ทันที
  };