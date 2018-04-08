# Using lightweight alpine image
FROM python:3.6-alpine

# Installing packages
RUN apk update
# RUN pip install --no-cache-dir <any_package_needed_in_future>

# Defining working directory and adding source code
WORKDIR /usr/src/app
COPY bootstrap.sh ./
COPY cashman ./cashman
COPY requirements.txt ./

# Install API dependencies
RUN pip install -r requirements.txt

# Start app
EXPOSE 5000
ENTRYPOINT ["/usr/src/app/bootstrap.sh"]
