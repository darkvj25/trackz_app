FROM php:8.2-apache

# Enable Apache rewrite module
RUN a2enmod rewrite

# Install PDO MySQL driver
RUN docker-php-ext-install pdo pdo_mysql

# Copy API files into Apache document root
COPY api/ /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
