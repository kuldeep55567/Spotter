from django.db import models

class spotter_users(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)  # Assuming passwords are pre-hashed
    name = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'spotter_users'  # Map to the existing table

    def __str__(self):
        return self.username

class Trip(models.Model):
    trip_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(spotter_users, on_delete=models.CASCADE)
    pickup_location_name = models.CharField(max_length=255)
    pickup_lat = models.DecimalField(max_digits=10, decimal_places=7)
    pickup_lng = models.DecimalField(max_digits=10, decimal_places=7)
    dropoff_location_name = models.CharField(max_length=255)
    dropoff_lat = models.DecimalField(max_digits=10, decimal_places=7)
    dropoff_lng = models.DecimalField(max_digits=10, decimal_places=7)
    total_distance = models.DecimalField(max_digits=10, decimal_places=2, help_text='in miles')
    total_duration = models.DecimalField(max_digits=10, decimal_places=2, help_text='in hours')
    driving_time = models.DecimalField(max_digits=10, decimal_places=2, help_text='in hours')
    rest_time = models.DecimalField(max_digits=10, decimal_places=2, help_text='in hours')
    total_hos_used = models.DecimalField(max_digits=10, decimal_places=2, help_text='in hours')
    initial_hos = models.DecimalField(max_digits=10, decimal_places=2, help_text='initial HOS at start')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trips'

    def __str__(self):
        return f"Trip {self.trip_id}: {self.pickup_location_name} to {self.dropoff_location_name}"

class DriverLog(models.Model):
    STATUS_CHOICES = [
        ('Driving', 'Driving'),
        ('Resting', 'Resting'),
        ('Pickup', 'Pickup'),
        ('Dropoff', 'Dropoff'),
        ('Off Duty', 'Off Duty'),
        ('Refueling', 'Refueling'),
    ]
    
    log_id = models.AutoField(primary_key=True)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    user = models.ForeignKey(spotter_users, on_delete=models.CASCADE)
    log_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    description = models.TextField()
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    miles_remaining = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'driver_logs'
        indexes = [
            models.Index(fields=['user', 'log_time']),
            models.Index(fields=['trip']),
        ]

    def __str__(self):
        return f"{self.status} at {self.log_time}"

class Stop(models.Model):
    STOP_TYPE_CHOICES = [
        ('Rest', 'Rest'),
        ('Refueling', 'Refueling'),
        ('Pickup', 'Pickup'),
        ('Dropoff', 'Dropoff'),
        ('Other', 'Other'),
    ]
    
    stop_id = models.AutoField(primary_key=True)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    user = models.ForeignKey(spotter_users, on_delete=models.CASCADE)
    stop_time = models.DateTimeField()
    stop_name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    stop_type = models.CharField(max_length=20, choices=STOP_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stops'
        indexes = [
            models.Index(fields=['user', 'stop_time']),
            models.Index(fields=['trip']),
        ]

    def __str__(self):
        return f"{self.stop_type} at {self.stop_name}"

class DailyHOSSummary(models.Model):
    summary_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(spotter_users, on_delete=models.CASCADE)
    log_date = models.DateField()
    total_drive_time = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='in hours')
    total_duty_time = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='in hours')
    total_rest_time = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='in hours')
    available_drive_time = models.DecimalField(max_digits=5, decimal_places=2, default=11, help_text='in hours')
    available_duty_time = models.DecimalField(max_digits=5, decimal_places=2, default=14, help_text='in hours')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'daily_hos_summary'
        constraints = [
            models.UniqueConstraint(fields=['user', 'log_date'], name='unique_user_date')
        ]

    def __str__(self):
        return f"HOS Summary for {self.user.username} on {self.log_date}"