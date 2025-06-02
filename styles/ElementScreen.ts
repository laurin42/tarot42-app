import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F4F0', // Consistent with BirthdayScreen
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#8A7F7C',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A403D',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5F5B',
    textAlign: 'center',
    marginBottom: 30,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  elementButton: {
    width: '45%', // Two buttons per row with some spacing
    aspectRatio: 1, // Make them square
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  selectedElementButton: {
    borderWidth: 3,
    borderColor: '#6A5ACD', // Highlight color for selected element
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  elementText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A403D', // Default text color for elements
    marginTop: 8,
  },
  selectedElementText: {
    color: '#FFFFFF', // Text color for selected element (if background is dark enough)
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  skipButton: {
    backgroundColor: '#D3CFCB',
  },
  nextButton: {
    backgroundColor: '#6A5ACD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
